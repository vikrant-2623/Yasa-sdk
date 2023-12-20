import { useStore } from '@proctor/infra/hooks/ui-store';
import { useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import cameraImage from '../assets/camera.png';
import microphoneImage from '../assets/microphone.png';
import photoImage from '../assets/photo.png';
import screenShareImage from '../assets/screen-share.png';
import { useI18n } from 'agora-common-libs';

export const Conclusion = observer(() => {
  const t = useI18n();
  const STEPS = useMemo(
    () => [
      { text: t('fcr_exam_prep_label_camera'), image: cameraImage },
      { text: t('fcr_exam_prep_label_microphone'), image: microphoneImage },
      { text: t('fcr_exam_prep_label_take_photo'), image: photoImage },
      { text: t('fcr_exam_prep_label_share_screen'), image: screenShareImage },
    ],
    [],
  );
  const {
    pretestUIStore: { stepupStates },
  } = useStore();
  return (
    <Container>
      {STEPS.map((step, index) => (
        <Item key={step.text}>
          <ItemImg src={step.image} width="80px" height="80px" alt={step.text} />
          <ItemText>
            {stepupStates[index] ? (
              <SvgImg type={SvgIconEnum.TICK} colors={{ iconPrimary: '#000' }} size={20}></SvgImg>
            ) : (
              <SvgImg type={SvgIconEnum.CLOSE} colors={{ iconPrimary: '#000' }} size={20}></SvgImg>
            )}
            <span>{step.text}</span>
          </ItemText>
        </Item>
      ))}
    </Container>
  );
});

const Container = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Item = styled.div`
  width: 129px;
  height: 169px;
  border-radius: 16px;
  background: #454466;
`;

const ItemImg = styled.img`
  margin: 0 auto;
  margin-top: 19px;
  margin-bottom: 10px;
`;

const ItemText = styled.div`
  text-align: center;
  height: 60px;
  line-height: 60px;
  border-radius: 16px;
  border: 1px solid #dbdfec;
  font-weight: 600;
  font-size: 14px;
  color: #000;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
`;
