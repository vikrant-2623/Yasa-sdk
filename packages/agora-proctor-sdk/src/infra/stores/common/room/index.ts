import { AgoraProctorSDK, ConvertMediaOptionsConfig } from '@proctor/infra/api';
import { transI18n } from 'agora-common-libs';
import {
  AGEduErrorCode,
  AgoraEduClassroomEvent,
  ClassroomState,
  ClassState,
  EduClassroomConfig,
  EduErrorCenter,
  EduEventCenter,
  EduRole2RteRole,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  EduSessionInfo,
  LeaveReason,
} from 'agora-edu-core';
import {
  AGError,
  AgoraRteMediaPublishState,
  AgoraRteMediaSourceState,
  AgoraRteScene,
  AGRtcConnectionType,
  bound,
  Logger,
  retryAttempt,
} from 'agora-rte-sdk';
import to from 'await-to-js';
import dayjs from 'dayjs';
import md5 from 'js-md5';
import {
  action,
  computed,
  IReactionDisposer,
  Lambda,
  observable,
  reaction,
  runInAction,
  when,
} from 'mobx';
import { computedFn } from 'mobx-utils';
import { EduUIStoreBase } from '../base';
import { SceneSubscription, SubscriptionFactory } from '../subscription/room';
import { UserAbnormalReason, UserAbnormalType } from '../type';
import { RoomScene } from './struct';
/**
 * 管理rte房间相关逻辑
 */

export class RoomUIStore extends EduUIStoreBase {
  /**
   * 房间内订阅逻辑，key=roomid
   */
  private _sceneSubscriptions: Map<string, SceneSubscription> = new Map<
    string,
    SceneSubscription
  >();
  /**
   * 管理子rte房间
   */
  @observable roomScenes: Map<string, RoomScene> = new Map();

  private _disposers: (IReactionDisposer | Lambda)[] = [];

  /**
   * 房间关闭状态，用于控制房间结束后的弹框状态
   */
  @observable roomClosed: boolean = false;
  @action.bound
  setRoomClosed(closed: boolean) {
    this.roomClosed = closed;
  }

  /**
   * 根据roomid获取房间对象
   */
  roomSceneByRoomUuid = computedFn((roomUuid: string) => {
    return this.roomScenes.get(roomUuid);
  });
  /**
   * 基于rte房间实例绑定订阅逻辑
   * @param scene
   * @returns
   */
  createSceneSubscription(scene: AgoraRteScene) {
    if (!this._sceneSubscriptions.has(scene.sceneId)) {
      const sub = SubscriptionFactory.createSubscription(scene);

      sub && this._sceneSubscriptions.set(scene.sceneId, sub);
    }
    return this._sceneSubscriptions.get(scene.sceneId);
  }
  @bound
  async updateClassState(roomUuid: string, state: ClassState) {
    await this.classroomStore.api.updateClassState({ roomUuid, state });
  }
  /**
   * 加入rte房间
   * @param roomUuid
   * @param roomType
   * @param stream
   * @returns
   */
  @bound
  async joinClassroom(
    roomUuid: string,
    roomType?: EduRoomTypeEnum,
    sessionInfo?: Partial<EduSessionInfo>,
    stream?: {
      videoState?: AgoraRteMediaPublishState | undefined;
      audioState?: AgoraRteMediaPublishState | undefined;
      videoSourceState?: AgoraRteMediaSourceState | undefined;
      audioSourceState?: AgoraRteMediaSourceState | undefined;
    },
  ) {
    //如果有正在加入状态的房间，不进行任何操作
    if (this.roomSceneByRoomUuid(roomUuid)) {
      if (this.roomSceneByRoomUuid(roomUuid)?.roomState.state !== ClassroomState.Connected) {
        return;
      }
    }

    const roomScene = new RoomScene(this.classroomStore);
    let engine = this.classroomStore.connectionStore.getEngine();

    let [error] = await to(
      retryAttempt(async () => {
        try {
          roomScene.setClassroomState(ClassroomState.Connecting);
          let { sessionInfo: EduSessionInfo } = EduClassroomConfig.shared;
          const session = {
            ...EduSessionInfo,
            ...sessionInfo,
            roomUuid,
            roomType: roomType ? roomType : EduSessionInfo.roomType,
          };
          //加入业务房间
          await this.checkIn(session, roomScene, stream);
          const scene = engine.createAgoraRteScene(roomUuid);
          this.createSceneSubscription(scene);
          roomScene.setScene(scene);
          // streamId defaults to 0 means server allocate streamId for you
          //加入rte房间
          await scene.joinScene({
            userName: session.userName,
            userRole: EduRole2RteRole(session.roomType, session.role),
            streamId: '0',
          });
          runInAction(() => {
            this.roomScenes.set(roomUuid, roomScene);
          });
        } catch (e) {
          console.log(e);
        }
      }, [])
        .fail(({ error }: { error: Error }) => {
          this.logger.error(error.message);
          return true;
        })
        .abort(() => {})
        .exec(),
    );

    if (error) {
      roomScene.setClassroomState(ClassroomState.Idle);
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_JOIN_CLASSROOM_FAIL,
        error,
      );
    }

    roomScene.setClassroomState(ClassroomState.Connected);
    return roomScene;
  }
  async checkIn(
    sessionInfo: EduSessionInfo,
    roomScene: RoomScene,
    stream?: {
      videoState?: AgoraRteMediaPublishState | undefined;
      audioState?: AgoraRteMediaPublishState | undefined;
      videoSourceState?: AgoraRteMediaSourceState | undefined;
      audioSourceState?: AgoraRteMediaSourceState | undefined;
    },
  ) {
    const { data, ts } = await this.classroomStore.api.checkIn(sessionInfo, undefined, stream);
    const { state = 0, startTime, duration, closeDelay = 0, rtcRegion, rtmRegion, vid } = data;
    EduClassroomConfig.shared.rteEngineConfig.setRtcRegion(rtcRegion);
    EduClassroomConfig.shared.rteEngineConfig.setRtmRegion(rtmRegion);
    roomScene.setCheckInData({
      vid,
      clientServerTime: ts,
      classRoomSchedule: {
        state,
        startTime,
        duration,
        closeDelay,
      },
      rtcRegion,
      rtmRegion,
    });
  }
  @bound
  async leaveClassroom(roomUuid: string) {
    await this.roomSceneByRoomUuid(roomUuid)?.leave();
    this.roomScenes.delete(roomUuid);
    this._sceneSubscriptions.delete(roomUuid);
  }

  /**
   * （仅学生场景使用）获取当前用户的分组房间id
   */
  get currentGroupUuid() {
    const { userUuid, roomUuid } = EduClassroomConfig.shared.sessionInfo;
    const userUuidPrefix = userUuid.split('-')[0];
    return md5(`${roomUuid}-${userUuidPrefix}`);
  }

  /**
   * 新增分组
   */
  @action.bound
  addGroup() {
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    const newUsers = { userUuid };
    const userUuidPrefix = userUuid.split('-')[0];

    this.classroomStore.groupStore.addGroups(
      [
        {
          groupUuid: this.currentGroupUuid,
          groupName: userUuidPrefix,
          users: [newUsers],
        },
      ],
      false,
    );
  }
  /**
   * 判断当前用户是否创建过子房间
   */
  private _checkUserRoomState = () => {
    const group = this.classroomStore.groupStore.groupDetails.get(this.currentGroupUuid);

    if (!group) {
      Logger.info(`${this.currentGroupUuid} join in`);
      this.addGroup();
    } else {
      const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
      if (!group.users.find((user) => user.userUuid === userUuid)) {
        this.classroomStore.groupStore.updateGroupUsers(
          [
            {
              groupUuid: this.currentGroupUuid,
              addUsers: [userUuid],
            },
          ],
          false,
        );
      }
    }
  };
  @bound
  private _addGroupDetailsChange() {
    EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student &&
      this._checkUserRoomState();
  }

  @bound
  private async _handleClassroomEvent(type: AgoraEduClassroomEvent, args: any) {
    if (type === AgoraEduClassroomEvent.JoinSubRoom) {
      /**
       * 子房间创建完成后，加入对应rtc频道
       */
      const roomScene = await this.joinClassroom(this.currentGroupUuid, EduRoomTypeEnum.RoomGroup, {
        startTime: this.classroomStore.roomStore.classroomSchedule.startTime,
      });
      try {
        const launchLowStreamCameraEncoderConfigurations = (
          EduClassroomConfig.shared.rteEngineConfig.rtcConfigs as ConvertMediaOptionsConfig
        )?.defaultLowStreamCameraEncoderConfigurations;

        await this.classroomStore.mediaStore.enableDualStream(
          true,
          AGRtcConnectionType.main,
          roomScene?.scene,
        );

        await this.classroomStore.mediaStore.setLowStreamParameter(
          launchLowStreamCameraEncoderConfigurations ||
            EduClassroomConfig.defaultLowStreamParameter(),
          AGRtcConnectionType.main,
          roomScene?.scene,
        );
      } catch (e) {
        this.shareUIStore.addGenericErrorDialog(e as AGError);
      }
      if (roomScene) {
        await roomScene.scene?.joinRTC();
        this.classroomStore.streamStore.updateLocalPublishState(
          {
            videoState: AgoraRteMediaPublishState.Published,
            audioState: AgoraRteMediaPublishState.Published,
          },
          roomScene.scene,
        );
      }
    }
  }
  /**
   * 教室时间信息
   * @returns
   */
  @computed
  get classroomSchedule() {
    return this.classroomStore.roomStore.classroomSchedule;
  }
  /**
   * 教室状态
   * @returns
   */
  @computed
  get classState() {
    return this.classroomSchedule.state;
  }

  /**
   * 服务器时间
   * @returns
   */
  @computed
  get calibratedTime() {
    const { clockTime, clientServerTimeShift } = this.classroomStore.roomStore;
    return clockTime + clientServerTimeShift;
  }

  /**
   * 教室倒计时
   * @returns
   */
  @computed
  get classTimeDuration(): number {
    let duration = -1;
    if (this.classroomSchedule) {
      switch (this.classState) {
        case ClassState.beforeClass:
          if (this.classroomSchedule.startTime !== undefined) {
            duration = 0;
          }
          break;
        case ClassState.ongoing:
          if (this.classroomSchedule.startTime !== undefined) {
            duration = Math.max(
              this.classroomSchedule.duration
                ? this.classroomSchedule.duration * 1000 -
                    this.calibratedTime +
                    this.classroomSchedule.startTime
                : this.calibratedTime - this.classroomSchedule.startTime,
              0,
            );
          }
          break;
        case ClassState.afterClass:
          if (
            this.classroomSchedule.startTime !== undefined &&
            this.classroomSchedule.duration !== undefined
          ) {
            duration = Math.max(this.calibratedTime - this.classroomSchedule.startTime, 0);
          }
          break;
      }
    }
    return duration;
  }

  formatCountDown = (time: number) => {
    const classDuration = dayjs.duration(time, 'ms');
    return classDuration.format('mm:ss');
  };

  @computed
  get formatStartTime() {
    return dayjs(this.classroomSchedule.startTime).format('HH:mm');
  }
  /**
   * 教室状态文字
   * @returns
   */
  @computed
  get classStatusText() {
    const duration = this.classTimeDuration || 0;

    if (duration < 0) {
      return `00 : 00`;
    }
    switch (this.classState) {
      case ClassState.beforeClass:
        return this.formatStartTime;
      case ClassState.ongoing:
        return `${this.formatCountDown(duration)}`;
      case ClassState.afterClass:
        return `00 : 00`;
      default:
        return `00 : 00`;
    }
  }
  /**
   * 教室开课时间label文案
   */
  @computed
  get statusTextTip() {
    if (this.classState === ClassState.beforeClass) {
      return transI18n('fcr_room_label_start_time');
    } else {
      return transI18n('fcr_room_label_time_remaining');
    }
  }
  /** Hooks */
  onInstall() {
    this._disposers.push(
      computed(() => this.classroomStore.groupStore.groupDetails).observe(
        ({ newValue, oldValue }) => {
          if (!oldValue?.size) {
            this._addGroupDetailsChange();
          }
        },
      ),
    );
    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student) {
      this._disposers.push(
        reaction(
          () => this.classroomStore.roomStore.classroomSchedule.state,
          async (state) => {
            //考试结束
            if (ClassState.close === state) {
              if (this.roomScenes.get(this.currentGroupUuid)) {
                await this.leaveClassroom(this.currentGroupUuid);
              }
              this.classroomStore.connectionStore.leaveClassroom(
                LeaveReason.leave,
                when(() => this.roomClosed),
              );
            }
          },
        ),
      );
      //如果需要在学生屏幕共享断开时踢出学生
      if (AgoraProctorSDK.checkStudentScreenShareState) {
        this._disposers.push(
          computed(() => ({
            screenShareState: this.classroomStore.mediaStore.localScreenShareTrackState,
            classRoomState: this.roomSceneByRoomUuid(this.currentGroupUuid)?.roomState.state,
          })).observe(async ({ newValue, oldValue }) => {
            if (newValue.classRoomState === ClassroomState.Connected) {
              const { role } = EduClassroomConfig.shared.sessionInfo;
              if (
                (newValue.screenShareState === AgoraRteMediaSourceState.stopped ||
                  newValue.screenShareState === AgoraRteMediaSourceState.error) &&
                role === EduRoleTypeEnum.student
              ) {
                //上报异常事件
                this.classroomStore.api.updateUserTags({
                  key: 'abnormal',
                  data: {
                    reason: UserAbnormalReason.Screen_Disconnected,
                    type: UserAbnormalType.Screen_Disconnected,
                  },
                  roomUuid: EduClassroomConfig.shared.sessionInfo.roomUuid,
                  userUuid: EduClassroomConfig.shared.sessionInfo.userUuid,
                });
                if (this.roomScenes.get(this.currentGroupUuid)) {
                  await this.leaveClassroom(this.currentGroupUuid);
                }
                //退出房间

                this.classroomStore.connectionStore.leaveClassroom(
                  LeaveReason.leave,
                  new Promise((resolve) => {
                    this.shareUIStore.addConfirmDialog(
                      transI18n('fcr_alert_title'),
                      transI18n('fcr_exam_prep_label_close_screen_share'),
                      {
                        onOK: resolve,
                        btnText: { ok: transI18n('fcr_room_button_leave'), cancel: '' },
                        actions: ['ok'],
                      },
                    );
                  }),
                );
              }
            }
          }),
        );
      }
    } else {
      this._disposers.push(
        reaction(
          () => this.classroomStore.roomStore.classroomSchedule.state,
          async (state) => {
            if (ClassState.close === state) {
              if (this.roomScenes.size > 0) {
                this.roomScenes.forEach((r) => {
                  r.scene && this.leaveClassroom(r.scene.sceneId);
                });
              }
              this.classroomStore.connectionStore.leaveClassroom(
                LeaveReason.leave,
                new Promise((resolve) => {
                  this.shareUIStore.addConfirmDialog(
                    transI18n('fcr_alert_title'),
                    transI18n('fcr_room_label_exam_over'),
                    {
                      onOK: resolve,
                      btnText: { ok: transI18n('fcr_room_button_leave'), cancel: '' },
                      actions: ['ok'],
                    },
                  );
                }),
              );
            }
          },
        ),
      );
    }

    EduEventCenter.shared.onClassroomEvents(this._handleClassroomEvent);
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
