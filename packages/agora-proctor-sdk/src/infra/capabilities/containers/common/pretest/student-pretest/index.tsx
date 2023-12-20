import { useStore } from '@proctor/infra/hooks/ui-store';
import { AgoraStep, AgoraSteps } from '@proctor/infra/capabilities/components/steps';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { Conclusion } from './conclusion';
import { DeviceTest } from './device-test';
import { ImageSnapshot } from './image-snapshot';
import { ShareScreen } from './share-screen';
import { useMemo } from 'react';
import { useI18n } from 'agora-common-libs';
export const StudentPretest = observer(() => {
  const {
    pretestUIStore: { currentStep, headerStep },
  } = useStore();
  const t = useI18n();

  const PretestInfoByStep = useMemo(() => {
    return [
      {
        title: t('fcr_exam_prep_label_test_exam_device'),
        component: <DeviceTest />,
      },
      {
        title: t('fcr_exam_prep_label_align_face'),
        component: <ImageSnapshot />,
      },
      {
        title: t('fcr_exam_prep_label_authorize_share_screen'),
        component: <ShareScreen />,
      },
      {
        title: t('fcr_exam_prep_label_join_exam'),
        component: <Conclusion />,
      },
    ];
  }, []);
  return (
    <Container>
      <PreTestHeader>{t('fcr_home_page_scene_option_online_proctoring')}</PreTestHeader>
      <AgoraSteps current={headerStep} progressDot>
        <AgoraStep title="01" description={t('fcr_exam_prep_label_device_test')} />
        <AgoraStep title="02" description={t('fcr_exam_prep_label_take_photo')} />
        <AgoraStep title="03" description={t('fcr_exam_prep_label_share_screen')} />
      </AgoraSteps>
      <ProcessInfo>{PretestInfoByStep[currentStep].title}</ProcessInfo>
      {PretestInfoByStep[currentStep].component}
    </Container>
  );
});
export const TeacherPretest = observer(() => {
  const t = useI18n();

  return (
    <Container>
      <PreTestHeader>{t('fcr_home_page_scene_option_online_proctoring')}</PreTestHeader>
      <ProcessInfo>{t('fcr_exam_prep_label_test_exam_device')}</ProcessInfo>
      <DeviceTest />
    </Container>
  );
});
const Container = styled.div`
  height: 556px;
  padding: 0 53px;
  box-sizing: border-box;
`;
const PreTestHeader = styled.p`
  font-weight: 800;
  font-size: 26px;
  line-height: 26px;
  text-align: center;
  padding-top: 36px;
  padding-bottom: 20px;
`;

const ProcessInfo = styled(PreTestHeader)`
  font-size: 18px;
  font-weight: 400;
  padding: 30px 0 20px;
  margin-bottom: 0;
`;
