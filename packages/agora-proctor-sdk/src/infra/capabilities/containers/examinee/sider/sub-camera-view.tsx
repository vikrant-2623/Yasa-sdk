import { DeviceTypeEnum } from '@proctor/infra/api';
import { useStore } from '@proctor/infra/hooks/ui-store';
import { AgoraCard } from '@proctor/infra/capabilities/components/card';
import { SupervisorView } from '@proctor/infra/capabilities/components/supervisor-view';
import { EduClassroomConfig } from 'agora-edu-core';
import { AgoraRteVideoSourceType } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import { RemoteTrackPlayer } from '../../common/stream/track-player';
import styled from 'styled-components';

export const SubCameraView = () => {
  return (
    <AgoraCard>
      <SupervisorView tag="Phone" video={<SubCamera />} />
    </AgoraCard>
  );
};

const SubCamera = observer(() => {
  const { userUuid } = EduClassroomConfig.shared.sessionInfo;

  const {
    roomUIStore: { roomSceneByRoomUuid },
    usersUIStore: { generateDeviceUuid, generateGroupUuid },
  } = useStore();
  const userUuidPrefix = userUuid.split('-')[0];

  const roomUuid = generateGroupUuid(userUuidPrefix)!;
  const scene = roomSceneByRoomUuid(roomUuid);
  const subDeviceUserUuid = generateDeviceUuid(userUuidPrefix, DeviceTypeEnum.Sub);
  const subDeviceStreamUuid = Array.from(
    scene?.streamController?.streamByUserUuid.get(subDeviceUserUuid) || [],
  ).find(
    (streamUuid) =>
      scene?.streamController?.streamByStreamUuid.get(streamUuid)?.videoSourceType ===
      AgoraRteVideoSourceType.Camera,
  );
  const subDeviceStream = scene?.streamController?.streamByStreamUuid?.get(
    subDeviceStreamUuid || '',
  );
  return (
    <SubCameraContainer>
      {subDeviceStream ? (
        <RemoteTrackPlayer stream={subDeviceStream} fromScene={scene?.scene} />
      ) : (
        <SvgImg type={SvgIconEnum.NO_VIDEO} size={36}></SvgImg>
      )}
    </SubCameraContainer>
  );
});
const SubCameraContainer = styled.div`
  height: 133px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f0f7;
`;
