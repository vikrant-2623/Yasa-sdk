import { transI18n } from 'agora-common-libs';
import {
  AGEduErrorCode,
  AgoraEduClassroomEvent,
  BeautyType,
  ClassroomState,
  CloudDriveResourceUploadStatus,
  DEVICE_DISABLE,
  EduClassroomConfig,
  EduErrorCenter,
  EduEventCenter,
  LeaveReason,
} from 'agora-edu-core';
import { AGError, AGErrorWrapper, AgoraRteMediaSourceState, bound, Logger } from 'agora-rte-sdk';
import { action, computed, Lambda, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { v4 as uuidv4 } from 'uuid';
import { EduUIStoreBase } from '../base';
import { CameraPlaceholderType, DeviceStateChangedReason } from '../type';
import { extractFileExt, fileExt2ContentType, supportedTypes } from './help';

export type PretestToast = {
  id: string;
  type: 'video' | 'audio_recording' | 'audio_playback' | 'error';
  info: string;
};

type AddToastArgs = Omit<PretestToast, 'id'>;

export enum EnumStep {
  one = 0,
  two,
  three,
  finished,
}

export class PretestUIStore extends EduUIStoreBase {
  private readonly _disposers = new Set<Lambda>();

  onInstall() {
    // 处理视频设备变动
    const videoDisposer = computed(() => this.classroomStore.mediaStore.videoCameraDevices).observe(
      ({ newValue, oldValue }) => {
        // 避免初始化阶段触发新设备的弹窗通知
        if (oldValue && oldValue.length > 1) {
          if (newValue.length > oldValue.length) {
            this.addToast({
              type: 'video',
              info: DeviceStateChangedReason.newDeviceDetected,
            });
          }
        }
      },
    );

    this._disposers.add(videoDisposer);

    // 处理录音设备变动
    const audioRecordingDisposer = computed(
      () => this.classroomStore.mediaStore.audioRecordingDevices,
    ).observe(({ newValue, oldValue }) => {
      // 避免初始化阶段触发新设备的弹窗通知
      if (oldValue && oldValue.length > 1) {
        if (newValue.length > oldValue.length) {
          this.addToast({
            type: 'audio_recording',
            info: DeviceStateChangedReason.newDeviceDetected,
          });
        }
      }
    });

    this._disposers.add(audioRecordingDisposer);

    // 处理扬声器设备变动
    const playbackDisposer = computed(
      () => this.classroomStore.mediaStore.audioPlaybackDevices,
    ).observe(({ newValue, oldValue }) => {
      // 避免初始化阶段触发新设备的弹窗通知
      if (oldValue && oldValue.length > 0) {
        if (newValue.length > oldValue.length) {
          this.addToast({
            type: 'audio_playback',
            info: DeviceStateChangedReason.newDeviceDetected,
          });
        }
      }
    });
    this._disposers.add(
      computed(() => this.classroomStore.connectionStore.classroomState).observe(
        ({ oldValue, newValue }) => {
          if (oldValue === ClassroomState.Connecting && newValue === ClassroomState.Connected) {
            Logger.info(`newvalue ${newValue}, oldvalue ${oldValue}`);
            if (this.avatarUrl) {
              const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
              this.classroomStore.userStore.updateUserProperties([
                { userUuid, properties: { avatar: this.avatarUrl } },
              ]);
            }
          }
        },
      ),
    );

    EduEventCenter.shared.onClassroomEvents(this._handleInteractionEvents);
  }

  /**
   * 交互事件通知
   * @param type
   */
  @bound
  private _handleInteractionEvents(type: AgoraEduClassroomEvent) {
    switch (type) {
      case AgoraEduClassroomEvent.CurrentCamUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.cameraUnplugged,
        });
        break;
      case AgoraEduClassroomEvent.CurrentMicUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.micUnplugged,
        });
        break;
      case AgoraEduClassroomEvent.CurrentSpeakerUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.playbackUnplugged,
        });
        break;
    }
  }

  private _timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Toast 消息列表
   */
  @observable
  toastQueue: PretestToast[] = [];

  /**
   * 美颜类型
   */
  @observable activeBeautyType: BeautyType = BeautyType.buffing;

  /**
   * 是否正在测试扬声器
   */
  @observable playbackTesting = false;

  /**
   * 当前步骤
   */
  @observable currentStep: number = EnumStep['one'];

  @observable snapshotImage: string = '';

  @observable snapshotImageProcess: boolean = false; // 默认头像没有进度

  @observable _snapshotImageFile?: File;

  /** 快照 */
  @observable avatarUrl: string = '';

  /**
   * 视频消息 Toast 列表
   * @returns
   */
  @computed
  get videoToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'video');
  }

  /**
   * 扬声器消息 Toast 列表
   * @returns
   */
  @computed
  get audioPlaybackToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'audio_playback');
  }

  /**
   * 麦克风消息 Toast 列表
   * @returns
   */
  @computed
  get audioRecordingToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'audio_recording');
  }

  /**
   * 错误消息 Toast 列表
   * @returns
   */
  @computed
  get errorToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'error');
  }

  /**
   * 摄像头设备列表
   * @returns
   */
  @computed get cameraDevicesList() {
    return this.classroomStore.mediaStore.videoCameraDevices.map((item) => ({
      label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
      value: item.deviceid,
    }));
  }

  /**
   * 麦克风设备列表
   * @returns
   */
  @computed get recordingDevicesList() {
    return this.classroomStore.mediaStore.audioRecordingDevices.map((item) => ({
      label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
      value: item.deviceid,
    }));
  }

  /**
   * 扬声器设备列表
   * @returns
   */
  @computed get playbackDevicesList() {
    const playbackDevicesList = this.classroomStore.mediaStore.audioPlaybackDevices.map((item) => ({
      label: item.devicename,
      value: item.deviceid,
    }));
    return playbackDevicesList.length
      ? playbackDevicesList
      : [
          {
            label: transI18n(`fcr_device_test_label_default`),
            value: 'default',
          },
        ];
  }

  /**
   * 当前摄像头设备ID
   * @returns
   */
  @computed get currentCameraDeviceId(): string {
    return this.classroomStore.mediaStore.cameraDeviceId ?? '';
  }

  /**
   * 当前麦克风设备ID
   * @returns
   */
  @computed get currentRecordingDeviceId(): string {
    return this.classroomStore.mediaStore.recordingDeviceId ?? '';
  }

  /**
   * 当前扬声器设备ID
   * @returns
   */
  @computed get currentPlaybackDeviceId(): string {
    return this.classroomStore.mediaStore.playbackDeviceId ?? 'default';
  }

  /**
   * 麦克风音量
   * @returns 音量 0 ~ 1
   */
  @computed get localVolume(): number {
    return this.classroomStore.mediaStore.recordingDeviceId === DEVICE_DISABLE
      ? 0
      : this.classroomStore.mediaStore.localMicAudioVolume * 100;
  }

  /**
   * 扬声器测试音量
   * @returns 音量 0 ~ 1
   */
  @computed get localPlaybackTestVolume(): number {
    return this.classroomStore.mediaStore.localPlaybackTestVolume * 100;
  }

  /**
   * 本地摄像头设备状态
   * @returns
   */
  @computed get localCameraTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localCameraTrackState;
  }

  /**
   * 本地麦克风设备状态
   * @returns
   */
  @computed get localMicTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localMicTrackState;
  }

  /**
   * 本地摄像头是否开启
   * @returns
   */
  @computed get localCameraOff() {
    return this.localCameraTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 本地麦克风设备是否开启
   * @returns
   */
  @computed get localMicOff() {
    return this.localMicTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 本地音频设备状态显示的 Icon 类型
   * microphone-off 麦克风开启
   * microphone-on  麦克风关闭
   * @returns Icon 类型
   */
  @computed get localMicIconType() {
    return this.localMicOff ? 'microphone-off' : 'microphone-on';
  }

  /**
   * 本地视频状态显示的占位符类型
   * @returns
   */
  @computed get localCameraPlaceholder(): CameraPlaceholderType {
    let placeholder = CameraPlaceholderType.none;
    switch (this.localCameraTrackState) {
      case AgoraRteMediaSourceState.started:
        placeholder = CameraPlaceholderType.none;
        break;
      case AgoraRteMediaSourceState.starting:
        placeholder = CameraPlaceholderType.loading;
        break;
      case AgoraRteMediaSourceState.stopped:
        placeholder = CameraPlaceholderType.muted;
        break;
      case AgoraRteMediaSourceState.error:
        placeholder = CameraPlaceholderType.broken;
        break;
    }
    return placeholder;
  }

  /**
   * @ignore
   */
  @computed get disable(): boolean {
    return false;
  }

  /**
   * 是否开启镜像
   * @returns
   */
  @computed
  get isMirror() {
    return this.classroomStore.mediaStore.isMirror;
  }

  @computed
  get headerStep() {
    if (this.currentStep === EnumStep['three'] || this.currentStep === EnumStep['finished']) {
      return EnumStep['three'];
    }
    return this.currentStep;
  }

  /**
   * 是否在屏幕分享中
   */
  @computed
  get isScreenSharing() {
    return (
      this.classroomStore.mediaStore.localScreenShareTrackState === AgoraRteMediaSourceState.started
    );
  }

  /**
   * 是否选择了多媒体
   */
  @computed
  get isMediaReady() {
    return (
      this.classroomStore.mediaStore.localCameraTrackState === AgoraRteMediaSourceState.started &&
      this.classroomStore.mediaStore.localMicTrackState === AgoraRteMediaSourceState.started
    );
  }

  @computed
  get stepupStates() {
    return [
      this.classroomStore.mediaStore.localCameraTrackState === AgoraRteMediaSourceState.started,
      this.classroomStore.mediaStore.localMicTrackState === AgoraRteMediaSourceState.started,
      this.snapshotImage,
      this.isScreenSharing,
    ];
  }

  /**
   * 右下角按钮点击状态
   */
  @computed
  get rightBtnDisable() {
    if (this.currentStep === 0) return !this.isMediaReady;
    if (this.currentStep === 1) return !this.snapshotImage && !this.snapshotImageProcess;
    if (this.currentStep === 2) return !this.isScreenSharing;
    if (this.currentStep === 3)
      return (
        this.classroomStore.mediaStore.localCameraTrackState !== AgoraRteMediaSourceState.started ||
        this.classroomStore.mediaStore.localMicTrackState !== AgoraRteMediaSourceState.started ||
        !this.snapshotImage ||
        !this.isScreenSharing
      );
    return false;
  }

  @computed
  get rightBtnText() {
    if (this.currentStep === 0 || this.currentStep === 1)
      return transI18n('fcr_exam_prep_button_next_step');
    if (this.currentStep === 2) return transI18n('fcr_exam_prep_button_confirm_sharing');
    if (this.currentStep === 3) return transI18n('fcr_exam_prep_button_join_exam');
  }

  /**
   * 美颜类型 Icon
   */
  activeBeautyTypeIcon = computedFn((item) =>
    this.activeBeautyType === item.id
      ? { icon: item.icon, color: '#fff' }
      : { icon: item.icon, color: 'rgba(255,255,255,.5)' },
  );

  /**
   * 显示 Toast 信息
   * @param toast
   */
  @action.bound
  addToast(toast: AddToastArgs) {
    Logger.info(`[pretest] add toast ${toast.type}`);
    this.toastQueue.push({
      id: uuidv4(),
      ...toast,
    });
  }

  /**
   * 移除 Toast 信息
   * @param id
   * @returns
   */
  @action.bound
  removeToast(id: string) {
    this.toastQueue = this.toastQueue.filter((value) => value.id !== id);
    return id;
  }

  /**
   * 设置镜像开启或关闭
   * @param v 开启或关闭
   */
  @bound
  setMirror(v: boolean) {
    this.classroomStore.mediaStore.setMirror(v);
  }

  /**
   * 开始扬声器测试
   * @param url
   */
  @action.bound
  startPlaybackDeviceTest(url: string) {
    this.playbackTesting = true;
    this.classroomStore.mediaStore.startPlaybackDeviceTest(url);
    this._timer && clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.stopPlaybackDeviceTest();
    }, 3000);
  }

  /**
   * 停止扬声器测试
   */
  @action.bound
  stopPlaybackDeviceTest() {
    this.playbackTesting = false;
    this.classroomStore.mediaStore.stopPlaybackDeviceTest();
  }

  /**
   * 开始麦克风测试
   */
  @bound
  startRecordingDeviceTest() {
    this.classroomStore.mediaStore.startRecordingDeviceTest(500);
  }

  /**
   * 停止麦克风测试
   */
  @bound
  stopRecordingDeviceTest() {
    this.classroomStore.mediaStore.stopRecordingDeviceTest();
  }

  /**
   * 打开本地摄像头
   * @param value 开启或关闭
   */
  @bound
  enableLocalVideo(value: boolean) {
    this.classroomStore.mediaStore.enableLocalVideo(value);
  }

  /**
   * 打开本地麦克风
   * @param value 开启或关闭
   */
  @bound
  enableLocalAudio(value: boolean) {
    this.classroomStore.mediaStore.enableLocalAudio(value);
  }

  /**
   * 设置当前使用摄像头设备
   * @param id
   */
  @action.bound
  setCameraDevice(id: string) {
    this.classroomStore.mediaStore.setCameraDevice(id);
  }

  /**
   * 设置当前使用麦克风设备
   * @param id
   */
  @action.bound
  setRecordingDevice(id: string) {
    this.classroomStore.mediaStore.setRecordingDevice(id);
    if (id === DEVICE_DISABLE) {
      this.stopRecordingDeviceTest();
    } else {
      this.startRecordingDeviceTest();
    }
  }

  /**
   * 设置美颜类型
   * @param value
   */
  @action.bound
  setActiveBeautyType(value: BeautyType) {
    this.activeBeautyType = value;
  }

  /**
   * 设置当前使用扬声器设备
   * @param id
   */
  @bound
  setPlaybackDevice(id: string) {
    this.classroomStore.mediaStore.setPlaybackDevice(id);
  }

  /**
   * 渲染本地视频
   * @param dom
   * @param mirror
   */
  @bound
  setupLocalVideo(dom: HTMLElement, mirror: boolean) {
    this.classroomStore.mediaStore.setupLocalVideo(dom, mirror);
  }

  /**
   * 设置当前的步骤
   * @param step
   */
  @action.bound
  setCurrentStep(step: number) {
    this.currentStep = step;
  }

  /**
   * 设置上一步
   */
  @action.bound
  setPrevStep() {
    let currentStep = this.currentStep - 1;
    this.setCurrentStep(currentStep);
  }

  @bound
  private _backToLoginPage() {
    EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.Destroyed, LeaveReason.leave);
  }
  @bound
  handleClose() {
    this._backToLoginPage();
  }

  @action
  handlePersonalAvatar = async () => {
    if (!this._snapshotImageFile) {
      return Promise.reject('has not image file');
    }
    let fileData = await this.uploadPersonalResource(this._snapshotImageFile);
    if (!fileData?.url) {
      return Promise.reject('upload image error');
    }
    runInAction(() => {
      this.avatarUrl = fileData?.url as string;
    });
  };

  /**
   * 设置下一步
   */
  @action.bound
  async setNextStep(okCallback: () => void) {
    try {
      if (this.currentStep === EnumStep['two'] && this._snapshotImageFile) {
        runInAction(() => {
          this.snapshotImageProcess = true;
        });
        // upload image
        await this.handlePersonalAvatar();
        runInAction(() => {
          this.snapshotImageProcess = false;
        });
      }
      let currentStep = this.currentStep + 1;
      if (currentStep > EnumStep['finished']) {
        // finish
        okCallback();
        return;
      }
      this.setCurrentStep(currentStep);
    } catch (e) {
      runInAction(() => {
        this.snapshotImageProcess = false;
      });
      Logger.warn(e);
    }
  }

  /**
   * 上传文件
   * @param file
   * @returns
   */
  @bound
  async uploadPersonalResource(file: File) {
    try {
      let ext = extractFileExt(file.name);
      if (!ext) {
        return this.shareUIStore.addGenericErrorDialog(
          AGErrorWrapper(
            AGEduErrorCode.EDU_ERR_UPLOAD_FAILED_NO_FILE_EXT,
            new Error(`no file ext`),
          ),
        );
      }

      ext = ext.toLowerCase();

      const resourceUuid = await this.classroomStore.cloudDriveStore.calcResourceUuid(file);

      if (!supportedTypes.includes(ext)) {
        this.classroomStore.cloudDriveStore._updateProgress(
          resourceUuid,
          undefined,
          CloudDriveResourceUploadStatus.Failed,
        );
        return EduErrorCenter.shared.handleNonThrowableError(
          AGEduErrorCode.EDU_ERR_INVALID_CLOUD_RESOURCE,
          new Error(`unsupported file type ${ext}`),
        );
      }
      const contentType = fileExt2ContentType(ext);

      const data = await this.classroomStore.cloudDriveStore.uploadPersonalResource(
        file,
        resourceUuid,
        ext,
        contentType,
      );

      return data;
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   *  处理弹窗左下角按钮操作
   */
  @action.bound
  handleLeftBtnAction() {
    if (this.currentStep <= 0) {
      this._backToLoginPage();
    } else {
      this.setPrevStep();
    }
  }

  /**
   * 截图
   */
  @bound
  async getSnapshot() {
    const { userUuid, roomUuid } = EduClassroomConfig.shared.sessionInfo;
    let imageData = this.classroomStore.mediaStore.mediaControl.getCurrentFrameData('', '', true);
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const canvasCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvasCtx.putImageData(imageData, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 1.0);
    const imageBlob = await new Promise((res, rej) => {
      canvas.toBlob((blob) => {
        res(blob);
      });
    });
    if (imageBlob) {
      runInAction(() => {
        this._snapshotImageFile = new File([imageBlob as BlobPart], `${userUuid}${roomUuid}.jpeg`);
      });
    }

    return base64;
  }

  @bound
  startLocalScreenShare() {
    if (!this.classroomStore.mediaStore.hasScreenSharePermission()) {
      this.shareUIStore.addToast(transI18n('toast2.screen_permission_denied'), 'warning');
    }

    return this.classroomStore.mediaStore.startScreenShareCapture();
  }

  /**
   * 渲染视频渲染
   * @param dom HTMLElement
   * @returns
   */
  @bound
  setupLocalScreenShare(dom: HTMLElement) {
    return this.classroomStore.mediaStore.setupLocalScreenShare(dom);
  }

  @action.bound
  async getSnapshotImage() {
    let base64 = await this.getSnapshot();
    runInAction(() => {
      this.snapshotImage = base64;
    });
  }

  @bound
  onDestroy() {
    EduEventCenter.shared.offClassroomEvents(this._handleInteractionEvents);
    for (const disposer of this._disposers) {
      disposer();
    }
    this._disposers.clear();
  }
}
