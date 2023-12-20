import './index.css';
import { useEffect, useMemo, useState, useRef, forwardRef, useImperativeHandle } from 'react';

import {
  UserEvents as userEventsType,
  VideosWallLayoutEnum,
  UserAbnormal as UserAbnormalType,
} from '@proctor/infra/stores/common/type';
import { useStore } from '@proctor/infra/hooks/ui-store';
import {
  RemoteTrackPlayer,
  RemoteTrackPlayerWithFullScreen,
} from '../../../common/stream/track-player';
import { observer } from 'mobx-react';
import { EduClassroomConfig, EduRoomTypeEnum } from 'agora-edu-core';
import {
  AgoraRteMediaPublishState,
  AgoraRteMediaSourceState,
  AgoraRteVideoSourceType,
  AGRtcConnectionType,
  AGRtcState,
} from 'agora-rte-sdk';
import dayjs from 'dayjs';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import { DeviceTypeEnum } from '@proctor/infra/api';
import { MediaController, MediaDeviceType } from './media-control';
import { Tag } from '@proctor/infra/capabilities/components/tag';
import { AgoraSlider } from '@proctor/infra/capabilities/components/slider';
import { useI18n } from 'agora-common-libs';
export const StudentCard = observer(
  ({ userUuidPrefix, renderVideos }: { userUuidPrefix: string; renderVideos: boolean }) => {
    const {
      layoutUIStore: { addStudentTab },
      usersUIStore: {
        videosWallLayout,

        generateDeviceUuid,
      },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();

    const mainDeviceUserUuid = useMemo(
      () => generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main),
      [],
    );

    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);

    return (
      <div
        className="fcr-student-card"
        onClick={() => addStudentTab(userUuidPrefix, mainDeviceStudent?.userName || 'student')}>
        {!!mainDeviceStudent?.userProperties?.get('tags')?.abnormal && (
          <div className="fcr-student-card-abnormal">
            <SvgImg type={SvgIconEnum.ABNORMAL}></SvgImg>
          </div>
        )}
        {renderVideos && (
          <StudentVideos userUuidPrefix={userUuidPrefix} layout={videosWallLayout} />
        )}

        <div className="fcr-student-card-extra">
          <div className="fcr-student-card-user">
            <UserAvatar userUuidPrefix={userUuidPrefix} />
            <div className="fcr-student-card-user-name" title={mainDeviceStudent?.userName}>
              {mainDeviceStudent?.userName}
            </div>
          </div>
          <div className="fcr-student-card-actions">
            <UserFocus userUuidPrefix={userUuidPrefix} />
            <UserEvents userUuidPrefix={userUuidPrefix}></UserEvents>
          </div>
        </div>
      </div>
    );
  },
);

export const StudentVideos = observer(
  ({
    layout,
    userUuidPrefix,
    showFullscreen = false,
    showTag = false,
  }: {
    layout: VideosWallLayoutEnum;
    userUuidPrefix: string;
    showFullscreen?: boolean;
    showTag?: boolean;
  }) => {
    const {
      roomUIStore: { joinClassroom, roomSceneByRoomUuid, leaveClassroom },
      usersUIStore: { generateDeviceUuid, generateGroupUuid },
      classroomStore: {
        roomStore: {
          classroomSchedule: { startTime },
        },
      },
    } = useStore();
    const mainDeviceUserUuid = useMemo(
      () => generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main),
      [],
    );
    const subDeviceUserUuid = useMemo(
      () => generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Sub),
      [],
    );
    const roomUuid = generateGroupUuid(userUuidPrefix)!;
    const [joinSuccess, setJoinSuccess] = useState(false);
    const scene = roomSceneByRoomUuid(roomUuid);

    const join = async () => {
      const roomScene = await joinClassroom(
        roomUuid,
        EduRoomTypeEnum.RoomGroup,
        { startTime },
        {
          videoState: AgoraRteMediaPublishState.Unpublished,
          audioState: AgoraRteMediaPublishState.Unpublished,
        },
      );
      if (roomScene?.scene) {
        await roomScene.scene.joinRTC();
        setJoinSuccess(true);
      }
    };
    useEffect(() => {
      join();
      return () => {
        leaveClassroom(roomUuid);
      };
    }, []);

    const screenShareStream =
      scene?.streamController?.screenShareStreamByUserUuid(mainDeviceUserUuid);

    const mainDeviceCameraStream =
      scene?.streamController?.cameraStreamByUserUuid(mainDeviceUserUuid);

    const subDeviceStream = scene?.streamController?.cameraStreamByUserUuid(subDeviceUserUuid);
    const Player = useMemo(
      () => (showFullscreen ? RemoteTrackPlayerWithFullScreen : RemoteTrackPlayer),
      [showFullscreen],
    );
    const rtcConnected = useMemo(() => {
      return scene?.rtcState.get(AGRtcConnectionType.main) === AGRtcState.Connected;
    }, [scene?.rtcState.get(AGRtcConnectionType.main)]);
    return (
      <div
        className={`fcr-student-card-videos ${
          layout === VideosWallLayoutEnum.Compact
            ? 'fcr-student-card-videos-compact'
            : 'fcr-student-card-videos-loose'
        }`}>
        <div className="fcr-student-card-videos-screen">
          {showTag && <Tag tagText={'Screen'}></Tag>}
          {rtcConnected &&
          screenShareStream &&
          screenShareStream.videoSourceState === AgoraRteMediaSourceState.started ? (
            <Player
              fromScene={scene?.scene}
              subscribeLowStream={false}
              mirrorMode={false}
              stream={screenShareStream}></Player>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO} size={36}></SvgImg>
          )}
        </div>
        <div className="fcr-student-card-videos-camera">
          {showTag && <Tag tagText={'PC'}></Tag>}

          {rtcConnected &&
          mainDeviceCameraStream &&
          mainDeviceCameraStream.videoSourceState === AgoraRteMediaSourceState.started ? (
            <Player
              placment="top"
              fromScene={scene?.scene}
              stream={mainDeviceCameraStream}></Player>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO} size={36}></SvgImg>
          )}
        </div>
        <div className="fcr-student-card-videos-mobile">
          {showTag && <Tag tagText={'Phone'}></Tag>}

          {rtcConnected &&
          subDeviceStream &&
          subDeviceStream.videoSourceState === AgoraRteMediaSourceState.started ? (
            <Player placment="top" fromScene={scene?.scene} stream={subDeviceStream}></Player>
          ) : (
            <SvgImg type={SvgIconEnum.NO_VIDEO} size={36}></SvgImg>
          )}
        </div>
      </div>
    );
  },
);

export const StudentHLSVideos = observer(
  forwardRef<
    { seek: (time: number) => void },
    {
      layout: VideosWallLayoutEnum;
      mainDeviceScreenVideo?: string;
      mainDeviceCameraVideo?: string;
      subDeviceCameraVideo?: string;
    }
  >(({ layout, mainDeviceScreenVideo, mainDeviceCameraVideo, subDeviceCameraVideo }, ref) => {
    const screenContainerRef = useRef<HTMLDivElement>(null);
    const mainCameraContainerRef = useRef<HTMLDivElement>(null);
    const subCameraContainerRef = useRef<HTMLDivElement>(null);
    const mediaControllerRef = useRef<MediaController | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isSliderChanging, setIsSliderChanging] = useState(false);

    useImperativeHandle(ref, () => ({
      seek: (time: number) => {
        mediaControllerRef.current?.syncPlyrCurrentTime(time);
      },
    }));
    useEffect(() => {
      if (screenContainerRef.current && mainDeviceScreenVideo) {
        mediaControllerRef.current?.setVideoUrl(MediaDeviceType.MainScreen, mainDeviceScreenVideo);
        mediaControllerRef.current?.setView(MediaDeviceType.MainScreen, screenContainerRef.current);
      }
    }, [mainDeviceScreenVideo]);
    useEffect(() => {
      if (mainCameraContainerRef.current && mainDeviceCameraVideo) {
        mediaControllerRef.current?.setVideoUrl(MediaDeviceType.MainCamera, mainDeviceCameraVideo);
        mediaControllerRef.current?.setView(
          MediaDeviceType.MainCamera,
          mainCameraContainerRef.current,
        );
      }
    }, [mainDeviceCameraVideo]);
    useEffect(() => {
      if (subCameraContainerRef.current && subDeviceCameraVideo) {
        mediaControllerRef.current?.setVideoUrl(MediaDeviceType.SubCamera, subDeviceCameraVideo);
        mediaControllerRef.current?.setView(
          MediaDeviceType.SubCamera,
          subCameraContainerRef.current,
        );
      }
    }, [subDeviceCameraVideo]);
    const onSliderChange = (val: number) => {
      mediaControllerRef.current?.syncPlyrCurrentTime(val);
    };
    useEffect(() => {
      mediaControllerRef.current = new MediaController();
      return mediaControllerRef.current.destroy;
    }, []);
    useEffect(() => {
      !isSliderChanging && setCurrentTime(mediaControllerRef.current?.currentTime || 0);
    }, [mediaControllerRef.current?.currentTime, isSliderChanging]);
    return (
      <div
        className={`fcr-student-card-videos fcr-student-card-hls-videos ${
          layout === VideosWallLayoutEnum.Compact
            ? 'fcr-student-card-videos-compact'
            : 'fcr-student-card-videos-loose'
        }`}>
        <div className="fcr-student-card-videos-progress">
          <AgoraSlider
            tooltip={{
              formatter: (val) => {
                return dayjs.duration(val || 0, 's').format('HH:mm:ss');
              },
            }}
            onAfterChange={(val) => {
              onSliderChange(val);
              setIsSliderChanging(false);
            }}
            onChange={(val) => {
              setIsSliderChanging(true);
              setCurrentTime(val);
            }}
            value={currentTime}
            min={0}
            max={mediaControllerRef.current?.totalDuration || 0}></AgoraSlider>
          <div className="fcr-student-card-videos-progress-btns">
            {mediaControllerRef.current?.isPlaying ? (
              <SvgImg
                type={SvgIconEnum.PAUSE}
                style={{ cursor: 'pointer' }}
                size={28}
                onClick={() => {
                  mediaControllerRef.current?.pause();
                }}></SvgImg>
            ) : (
              <SvgImg
                size={28}
                type={SvgIconEnum.PLAY}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  mediaControllerRef.current?.play();
                }}></SvgImg>
            )}
            <div>
              {dayjs.duration(mediaControllerRef.current?.currentTime || 0, 's').format('HH:mm:ss')}
              /
              {dayjs
                .duration(mediaControllerRef.current?.totalDuration || 0, 's')
                .format('HH:mm:ss')}
            </div>
          </div>
        </div>
        <div ref={screenContainerRef} className="fcr-student-card-videos-screen">
          <Tag tagText={'Screen'}></Tag>
          <div className="fcr-track-player-fullscreen-cover">
            <SvgImg
              className={'fcr-track-player-fullscreen-btn'}
              type={SvgIconEnum.VIDEO_FULLSCREEN}
              size={26}
              onClick={() => {
                mediaControllerRef.current?.requestFullscreen(MediaDeviceType.MainScreen);
              }}></SvgImg>
          </div>
        </div>

        <div ref={mainCameraContainerRef} className="fcr-student-card-videos-camera">
          <Tag tagText={'PC'}></Tag>
          <div className="fcr-track-player-fullscreen-cover fcr-track-player-fullscreen-cover-top">
            <SvgImg
              className={'fcr-track-player-fullscreen-btn'}
              type={SvgIconEnum.VIDEO_FULLSCREEN}
              size={26}
              onClick={() => {
                mediaControllerRef.current?.requestFullscreen(MediaDeviceType.MainCamera);
              }}></SvgImg>
          </div>
        </div>
        <div ref={subCameraContainerRef} className="fcr-student-card-videos-mobile">
          <Tag tagText={'Phone'}></Tag>
          <div className="fcr-track-player-fullscreen-cover fcr-track-player-fullscreen-cover-top">
            <SvgImg
              className={'fcr-track-player-fullscreen-btn'}
              type={SvgIconEnum.VIDEO_FULLSCREEN}
              size={26}
              onClick={() => {
                mediaControllerRef.current?.requestFullscreen(MediaDeviceType.SubCamera);
              }}></SvgImg>
          </div>
        </div>
      </div>
    );
  }),
);
export const UserEvents = observer(
  ({ userUuidPrefix, size = 30 }: { userUuidPrefix: string; size?: number }) => {
    const {
      usersUIStore: { generateDeviceUuid, queryUserEvents },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const [userEvents, setUserEvents] = useState<
      userEventsType<{
        abnormal: UserAbnormalType;
      }>[]
    >([]);
    const queryUserAbnormal = async () => {
      const res = await queryUserEvents(
        EduClassroomConfig.shared.sessionInfo.roomUuid,
        mainDeviceUserUuid,
        1600,
        'tags',
        'abnormal',
      );
      setUserEvents(res.list);
    };
    useEffect(() => {
      queryUserAbnormal();
    }, []);
    const mainDeviceUserUuid = generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main);
    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);
    return (
      <div className="fcr-student-card-actions-warning">
        {userEvents.length > 0 && (
          <div className="fcr-student-card-actions-warning-count">{userEvents.length}</div>
        )}
        <SvgImg
          type={
            mainDeviceStudent?.userProperties?.get('tags')?.abnormal
              ? SvgIconEnum.MESSAGE_ACTIVE
              : SvgIconEnum.MESSAGE_NORMAL
          }></SvgImg>
      </div>
    );
  },
);
export const UserAbnormal = observer(
  ({ userUuidPrefix, size = 30 }: { userUuidPrefix: string; size?: number }) => {
    const {
      usersUIStore: { generateDeviceUuid },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const mainDeviceUserUuid = generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main);
    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);
    return mainDeviceStudent?.userProperties?.get('tags')?.abnormal ? (
      <SvgImg type={SvgIconEnum.ABNORMAL} size={size}></SvgImg>
    ) : null;
  },
);
export const UserAvatar = observer(
  ({
    userUuidPrefix,
    size = 30,
    children,
  }: {
    userUuidPrefix: string;
    size?: number;
    children?: JSX.Element;
  }) => {
    const {
      usersUIStore: { generateDeviceUuid },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const mainDeviceUserUuid = generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main);
    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);

    return (
      <div style={{ position: 'relative' }}>
        {children}
        <div style={{ width: size, height: size }} className="fcr-student-card-user-avatar">
          <img src={mainDeviceStudent?.userProperties?.get('flexProps')?.avatar} />
        </div>
      </div>
    );
  },
);

export const UserFocus = observer(
  ({
    userUuidPrefix,
    size = 32,
    iconSize = 24,
  }: {
    userUuidPrefix: string;
    size?: number;
    iconSize?: number;
  }) => {
    const {
      usersUIStore: { generateDeviceUuid, updateUserTags },
      classroomStore: {
        userStore: { studentList },
      },
    } = useStore();
    const mainDeviceUserUuid = generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main);
    const subDeviceUserUuid = generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Sub);

    const mainDeviceStudent = studentList.get(mainDeviceUserUuid);
    const focus: React.MouseEventHandler = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await updateUserTags(
        'focus',
        mainDeviceStudent?.userProperties?.get('tags')?.focus === 1 ? 0 : 1,
        EduClassroomConfig.shared.sessionInfo.roomUuid,
        mainDeviceUserUuid,
      );
    };
    const t = useI18n();

    return (
      <div
        className="fcr-student-card-actions-like"
        style={{ width: size, height: size }}
        onClick={focus}
        title={t('fcr_room_tab_focus')}>
        <SvgImg
          size={iconSize}
          type={SvgIconEnum.FAV}
          colors={{
            iconPrimary:
              mainDeviceStudent?.userProperties?.get('tags')?.focus === 1 ? '#FF5474' : '#63626F',
          }}></SvgImg>
      </div>
    );
  },
);
