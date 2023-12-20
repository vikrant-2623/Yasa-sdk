import { useStore } from '@proctor/infra/hooks/ui-store';
import { isProduction } from '@proctor/infra/utils/env';
import { AgoraButton } from '@proctor/infra/capabilities/components/button';
import { AgoraMidBorderRadius, FlexCenterDiv } from '@proctor/infra/capabilities/components/common';
import { AgoraSelect } from '@proctor/infra/capabilities/components/select';
import { Select } from '@proctor/infra/capabilities/components/select/select';
import { Volume } from '@proctor/infra/capabilities/components/volume';
import { EduRteEngineConfig, EduRteRuntimePlatform } from 'agora-edu-core';
import { Col, Row } from 'antd';
import { observer } from 'mobx-react';
import { FC, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import PretestAudio from './assets/pretest-audio.mp3';
import { useI18n } from 'agora-common-libs';

const { Option } = AgoraSelect;
export const PreTestCamera: FC = observer(() => {
  const {
    pretestUIStore: { cameraDevicesList, currentCameraDeviceId, setCameraDevice },
  } = useStore();

  const handleCameraChange = useCallback((value) => {
    setCameraDevice(value);
  }, []);

  return (
    <Select
      value={currentCameraDeviceId}
      onChange={handleCameraChange}
      options={cameraDevicesList.map((device) => ({
        text: device.label,
        value: device.value,
      }))}></Select>
  );
});

export const PreTestMicrophone: FC = observer(() => {
  const {
    pretestUIStore: { recordingDevicesList, currentRecordingDeviceId, setRecordingDevice },
  } = useStore();
  const handleMicrophoneChange = useCallback((value) => {
    setRecordingDevice(value);
  }, []);
  return (
    <div style={{ paddingBottom: '20px' }}>
      <Select
        value={currentRecordingDeviceId}
        onChange={handleMicrophoneChange}
        options={recordingDevicesList.map((device) => ({
          text: device.label,
          value: device.value,
        }))}></Select>
      <VolumeDance />
    </div>
  );
});

export const PreTestSpeaker: FC = observer(() => {
  const {
    pretestUIStore: {
      playbackDevicesList,
      currentPlaybackDeviceId,
      setPlaybackDevice,
      startPlaybackDeviceTest,
      stopPlaybackDeviceTest,
    },
  } = useStore();
  const t = useI18n();
  const urlRef = useRef<string>(PretestAudio);
  const handlePlaybackChange = useCallback((value) => {
    setPlaybackDevice(value);
  }, []);

  useEffect(() => {
    if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron) {
      const path = window.require('path');
      urlRef.current = isProduction
        ? `${window.process.resourcesPath}/pretest-audio.mp3`
        : path.resolve('./assets/pretest-audio.mp3');
    }
    return stopPlaybackDeviceTest;
  }, []);

  return (
    <Row gutter={6}>
      <Col span={16}>
        <Select
          value={currentPlaybackDeviceId}
          onChange={handlePlaybackChange}
          options={playbackDevicesList.map((device) => ({
            text: device.label,
            value: device.value,
          }))}></Select>
      </Col>
      <Col span={8}>
        <AgoraButton
          type="primary"
          subType="black"
          size="large"
          style={{ width: '100%', borderRadius: '12px', paddingLeft: '15px', paddingRight: '15px' }}
          onClick={(_) => startPlaybackDeviceTest(urlRef.current)}>
          <FlexCenterDiv>
            <SvgImg type={SvgIconEnum.SPEAKER} size={30}></SvgImg>
            <span>{t('fcr_exam_prep_button_test')}</span>
          </FlexCenterDiv>
        </AgoraButton>
      </Col>
    </Row>
  );
});

export const PureVideo: FC<{ height?: string }> = observer((props) => {
  const {
    pretestUIStore: { setupLocalVideo },
  } = useStore();

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      setupLocalVideo(ref.current, false);
    }
  }, [ref]);

  return <VideoContainer ref={ref} height={props.height} />;
});

const VolumeDance: FC = observer(() => {
  const {
    pretestUIStore: { localVolume },
  } = useStore();

  return (
    <VolumeDanceContainer>
      <Row>
        <Col span={2}>
          <SvgImg type={SvgIconEnum.MICROPHONE_ON} />
        </Col>
        <Col span={22}>
          <Volume cursor={localVolume} peek={100} />
        </Col>
      </Row>
    </VolumeDanceContainer>
  );
});

const VideoContainer = styled.div<{ height?: string }>`
  width: 100%;
  height: ${(props) => (props.height ? props.height : '175px')};
  ${AgoraMidBorderRadius}
  overflow: hidden;
  margin-top: 8px;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
`;

const VolumeDanceContainer = styled.div`
  margin-top: 11px;
`;
