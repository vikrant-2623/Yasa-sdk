import { useStore } from '@proctor/infra/hooks/ui-store';
import {
  UserAbnormal as IUserAbnormal,
  UserAbnormalReason,
  UserAbnormalType,
  UserEvents,
  VideosWallLayoutEnum,
} from '@proctor/infra/stores/common/type';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import {
  StudentHLSVideos,
  StudentVideos,
  UserAbnormal,
  UserAvatar,
  UserFocus,
} from '../../student-card';
import './index.css';

import { DeviceTypeEnum } from '@proctor/infra/api';
import { EduClassroomConfig } from 'agora-edu-core';
import { AgoraRteVideoSourceType, Scheduler } from 'agora-rte-sdk';
import './index.css';
import { Select } from '@proctor/infra/capabilities/components/select/select';
import { useI18n } from 'agora-common-libs';
type RecordType = 'audio' | 'video' | 'av';
interface RecordItem {
  startTime: number;
  recordDetails: {
    streamUuid: string;
    type: RecordType;
    url: string;
    startTime: number;
  }[];
}

export const StudentDetail = observer(({ userUuidPrefix }: { userUuidPrefix: string }) => {
  const {
    roomUIStore: { roomSceneByRoomUuid },
    usersUIStore: {
      queryUserEvents,
      updateUserTags,
      generateDeviceUuid,
      queryRecordList,
      generateGroupUuid,
    },
  } = useStore();
  const queryRecordTask = useRef<Scheduler.Task>();
  const studentHlsVideosRef = useRef<{
    seek: (time: number) => void;
  }>(null);
  const mainDeviceUserUuid = useMemo(() => {
    return generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Main);
  }, []);
  const subDeviceUserUuid = useMemo(() => {
    return generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Sub);
  }, []);
  const roomUuid = useMemo(() => {
    return generateGroupUuid(userUuidPrefix);
  }, []);
  const roomScene = roomSceneByRoomUuid(roomUuid);

  const [userEvents, setUserEvents] = useState<
    UserEvents<{
      abnormal: IUserAbnormal;
    }>[]
  >([]);
  const [abnormal, setAbnormal] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState(0);
  const [record, setRecord] = useState<RecordItem>();
  const getRecord = (
    record: RecordItem | undefined,
    recordType: RecordType,
    userUuid: string,
    videoSourceType: AgoraRteVideoSourceType,
  ) =>
    record?.recordDetails?.find((i) => {
      return (
        i.type === recordType &&
        Array.from(roomScene?.streamController?.streamByUserUuid.get(userUuid) || []).find(
          (i) =>
            roomScene?.streamController?.streamByStreamUuid.get(i)?.videoSourceType ===
            videoSourceType,
        ) === i.streamUuid
      );
    });

  const mainDeviceScreenRecordUrl = getRecord(
    record,
    'video',
    mainDeviceUserUuid,
    AgoraRteVideoSourceType.ScreenShare,
  )?.url;
  const mainDeviceCameraRecordUrl = getRecord(
    record,
    'av',
    mainDeviceUserUuid,
    AgoraRteVideoSourceType.Camera,
  )?.url;
  const subDeviceCameraRecordUrl = getRecord(
    record,
    'video',
    subDeviceUserUuid,
    AgoraRteVideoSourceType.Camera,
  )?.url;

  const queryUserAbnormal = async () => {
    const res = await queryUserEvents(
      EduClassroomConfig.shared.sessionInfo.roomUuid,
      mainDeviceUserUuid,
      1600,
      'tags',
      'abnormal',
    );
    setUserEvents(
      (
        res.list as UserEvents<{
          abnormal: IUserAbnormal;
        }>[]
      ).sort((a, b) => b.sequence - a.sequence),
    );
  };
  useEffect(() => {
    queryUserAbnormal();
    queryRecords();
    return () => queryRecordTask.current?.stop();
  }, []);
  const submitAbnormal = useCallback(async () => {
    await updateUserTags(
      'abnormal',
      UserAbnormals.find((i) => i.reason === abnormal),
      EduClassroomConfig.shared.sessionInfo.roomUuid,
      mainDeviceUserUuid,
    );

    queryUserAbnormal();
  }, [abnormal]);

  const queryRecords = async () => {
    const { list } = (await queryRecordList(roomUuid!)) as { list: RecordItem[] };
    const currentRecord = list[list.length - 1 < 0 ? 0 : list.length - 1];
    const mainDeviceScreenRecordUrl = getRecord(
      currentRecord,
      'video',
      mainDeviceUserUuid,
      AgoraRteVideoSourceType.ScreenShare,
    )?.url;
    const mainDeviceCameraRecordUrl = getRecord(
      currentRecord,
      'av',
      mainDeviceUserUuid,
      AgoraRteVideoSourceType.Camera,
    )?.url;
    const subDeviceCameraRecordUrl = getRecord(
      currentRecord,
      'video',
      subDeviceUserUuid,
      AgoraRteVideoSourceType.Camera,
    )?.url;
    if (!mainDeviceScreenRecordUrl || !mainDeviceCameraRecordUrl || !subDeviceCameraRecordUrl) {
      queryRecordTask.current = Scheduler.shared.addDelayTask(queryRecords, 3000);
    }
    setRecord(currentRecord);
  };
  useEffect(() => {
    if (record && record.startTime !== startTime) {
      setStartTime(record.startTime);
    }
  }, [record, startTime]);
  const onUserEventClick = (ts: number) => {
    studentHlsVideosRef.current?.seek(dayjs.duration(Math.abs(ts - startTime), 'ms').asSeconds());
  };
  const { userAbnormalsI18nMap } = useUserAbnormalsI18n();
  const t = useI18n();

  return (
    <div className="fcr-student-detail-tab">
      <div className="fcr-student-detail-tab-replay">
        <StudentHLSVideos
          ref={studentHlsVideosRef}
          mainDeviceScreenVideo={mainDeviceScreenRecordUrl}
          mainDeviceCameraVideo={mainDeviceCameraRecordUrl}
          subDeviceCameraVideo={subDeviceCameraRecordUrl}
          layout={VideosWallLayoutEnum.Compact}
        />
        <div className="fcr-student-detail-tab-replay-bottom">
          <div className="fcr-student-detail-tab-replay-bottom-title">
            <Alarm></Alarm>
            <span>
              {t('fcr_sub_room_label_replay')}（{userEvents.length}）
            </span>
          </div>
          <UserEventsList
            userEvents={userEvents}
            startTime={startTime}
            onEventClick={onUserEventClick}></UserEventsList>
        </div>
      </div>
      <div className="fcr-student-detail-tab-live">
        <StudentVideos
          showFullscreen
          showTag
          userUuidPrefix={userUuidPrefix}
          layout={VideosWallLayoutEnum.Compact}
        />
        <div className="fcr-student-detail-tab-live-bottom">
          <div className="fcr-student-detail-tab-live-bottom-title">
            {t('fcr_sub_room_label_monitor')}
          </div>
          <div className="fcr-student-detail-tab-live-bottom-suspicious">
            <div className="fcr-student-detail-tab-live-bottom-suspicious-title">
              {t('fcr_sub_room_label_report_behavior')}
            </div>
            <div className="fcr-student-detail-tab-live-bottom-suspicious-btns">
              <div>
                <Select
                  theme="dark"
                  value={abnormal}
                  onChange={setAbnormal}
                  placeholder={t('fcr_sub_room_option_report_behavior_default')}
                  options={UserAbnormals.map((i) => {
                    return {
                      text: userAbnormalsI18nMap[i.reason],
                      value: i.reason,
                    };
                  })}></Select>
              </div>

              <Button
                onClick={submitAbnormal}
                disabled={!abnormal}
                size="large"
                type="primary"
                className="fcr-student-detail-tab-live-bottom-suspicious-submit">
                {t('fcr_sub_room_button_report_behavior_submit')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="fcr-student-detail-tab-info">
        <UserAvatar size={40} userUuidPrefix={userUuidPrefix}>
          <div className="fcr-student-detail-tab-info-abnormal">
            <UserAbnormal userUuidPrefix={userUuidPrefix} />
          </div>
        </UserAvatar>

        <UserFocus iconSize={35} size={50} userUuidPrefix={userUuidPrefix}></UserFocus>
      </div>
    </div>
  );
});

export const Alarm = () => {
  return (
    <div className="fcr-alarm">
      <SvgImg type={SvgIconEnum.ALARM} size={24}></SvgImg>
    </div>
  );
};
const useUserAbnormalsI18n = () => {
  const t = useI18n();

  const userAbnormalsI18nMap = useMemo(
    () => ({
      [UserAbnormalReason.Electronic_Devices]: t('fcr_sub_room_option_report_electronic_devices'),
      [UserAbnormalReason.ID_Verification]: t('fcr_sub_room_option_report_ID_verification'),
      [UserAbnormalReason.Multiple_People]: t('fcr_sub_room_option_report_multiple_people'),
      [UserAbnormalReason.Paperworks]: t('fcr_sub_room_option_report_paperworks'),
      [UserAbnormalType.Screen_Disconnected]: t('fcr_sub_room_label_web_disconnected'),
    }),
    [],
  );
  const userAbnormalTypeI18nMap = useMemo(
    () => ({
      [UserAbnormalType.Ai]: t('fcr_sub_room_label_AI_description'),
      [UserAbnormalType.Manual]: t('fcr_sub_room_label_Human_description'),
      [UserAbnormalType.Screen_Disconnected]: t('fcr_sub_room_label_web_disconnected'),
    }),
    [],
  );
  return { userAbnormalsI18nMap, userAbnormalTypeI18nMap };
};

const UserAbnormals: IUserAbnormal[] = [
  { reason: UserAbnormalReason.Electronic_Devices, type: UserAbnormalType.Manual },
  { reason: UserAbnormalReason.ID_Verification, type: UserAbnormalType.Manual },
  { reason: UserAbnormalReason.Multiple_People, type: UserAbnormalType.Manual },
  { reason: UserAbnormalReason.Paperworks, type: UserAbnormalType.Manual },
];

export const UserEventsList = observer(
  ({
    userEvents,
    onEventClick,
    startTime,
  }: {
    startTime: number;
    userEvents: UserEvents<{
      abnormal: IUserAbnormal;
    }>[];
    onEventClick: (timestamp: number) => void;
  }) => {
    const { userAbnormalsI18nMap, userAbnormalTypeI18nMap } = useUserAbnormalsI18n();
    const [currentEvent, setCurrentEvent] = useState(-1);
    return (
      <div className="fcr-student-detail-tab-replay-bottom-list">
        {userEvents.map((e, index) => {
          return (
            <div
              key={e.ts}
              className={`fcr-student-detail-tab-replay-bottom-list-item ${
                currentEvent === e.sequence
                  ? 'fcr-student-detail-tab-replay-bottom-list-item-active'
                  : ''
              }`}
              onClick={() => {
                onEventClick(e.ts);
                setCurrentEvent(e.sequence);
              }}>
              <div>{Math.abs(index - userEvents.length)}</div>
              <div>
                <div className="fcr-student-detail-tab-replay-bottom-list-item-logo">
                  <SvgImg type={SvgIconEnum.AI} size={36}></SvgImg>
                </div>
                <div className="fcr-student-detail-tab-replay-bottom-list-item-info">
                  <div className="fcr-student-detail-tab-replay-bottom-list-item-type">
                    {dayjs
                      .duration(startTime === 0 ? 0 : Math.abs(e.ts - startTime), 'ms')
                      .format('HH:mm:ss')}{' '}
                    {userAbnormalsI18nMap[e.data?.abnormal?.reason]}
                  </div>
                  <div className="fcr-student-detail-tab-replay-bottom-list-item-desc">
                    {userAbnormalTypeI18nMap[e.data?.abnormal?.type]}
                  </div>
                </div>
              </div>
              <div>
                <SvgImg type={SvgIconEnum.REPLAY} size={40}></SvgImg>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);
