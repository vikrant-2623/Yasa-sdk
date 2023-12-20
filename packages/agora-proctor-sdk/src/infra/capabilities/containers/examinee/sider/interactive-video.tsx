import { useStore } from '@proctor/infra/hooks/ui-store';
import { Space } from 'antd';
import { observer } from 'mobx-react';
import styled, { css } from 'styled-components';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import { RemoteTrackPlayer } from '../../common/stream/track-player';
import { useMemo } from 'react';
import { AgoraRteMediaPublishState } from 'agora-rte-sdk';
import { VolumeIndicator } from '@proctor/infra/capabilities/components/indicator';
export const InteractiveVideo = observer(() => {
  const {
    studentViewUIStore: { userAvatar },
    streamUIStore: { teacherCameraStream },
  } = useStore();
  const isTeacherCameraStreamEnabled = useMemo(() => {
    return (
      teacherCameraStream &&
      (teacherCameraStream.stream.audioState === AgoraRteMediaPublishState.Published ||
        teacherCameraStream.stream.videoState === AgoraRteMediaPublishState.Published)
    );
  }, [
    teacherCameraStream,
    teacherCameraStream?.stream.audioState,
    teacherCameraStream?.stream.videoState,
  ]);
  return (
    <Space direction="vertical" size={15}>
      <StudentPhoto scale={isTeacherCameraStreamEnabled ? 0.5 : 1} backgroundImage={userAvatar} />
      {isTeacherCameraStreamEnabled && (
        <TeacherVideo>
          {!teacherCameraStream?.isMicMuted && <VolumeIndicator></VolumeIndicator>}
          {teacherCameraStream?.isCameraMuted ? (
            <SvgImg type={SvgIconEnum.NO_VIDEO} size={36}></SvgImg>
          ) : (
            <RemoteTrackPlayer subscribeLowStream={false} stream={teacherCameraStream!.stream} />
          )}
        </TeacherVideo>
      )}
    </Space>
  );
});

const videoWidth = 193,
  videoHeight = 135;

const siderVideoBox = css`
  width: ${videoWidth}px;
  height: ${videoHeight}px;
  border-radius: 16px;
  background: #f8faff;
`;

const StudentPhoto = styled.div<{ scale?: number; backgroundImage?: string }>`
  ${siderVideoBox}
  ${(props) =>
    props.scale &&
    css`
      width: ${videoWidth * props.scale}px;
      height: ${videoHeight * props.scale}px;
    `}
  ${(props) =>
    props.backgroundImage &&
    css`
      background: url(${props.backgroundImage});
      background-repeat: no-repeat;
      background-size: cover;
      transform: rotateY(180deg);
    `}
`;

const TeacherVideo = styled.div`
  ${siderVideoBox};
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  & video {
    object-fit: cover !important;
  }
  & .video-volume {
    position: absolute;
    bottom: 5px;
    left: 5px;
    z-index: 9;
  }
`;
