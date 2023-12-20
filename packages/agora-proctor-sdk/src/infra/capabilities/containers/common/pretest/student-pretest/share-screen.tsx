import { useStore } from '@proctor/infra/hooks/ui-store';
import {
  AgoraLargeBorderRadius,
  AgoraMidBorderRadius,
} from '@proctor/infra/capabilities/components/common';
import { observer } from 'mobx-react';
import { useEffect, useRef, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { AgoraButton } from '@proctor/infra/capabilities/components/button';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import { useI18n } from 'agora-common-libs';

export const ShareScreen = observer(() => {
  const {
    pretestUIStore: { isScreenSharing, setupLocalScreenShare, startLocalScreenShare },
  } = useStore();
  const t = useI18n();
  const shareRef = useRef<HTMLDivElement | null>();

  useLayoutEffect(() => {
    !isScreenSharing && startLocalScreenShare();
  }, [isScreenSharing]);

  useEffect(() => {
    isScreenSharing && setupLocalScreenShare(shareRef.current as HTMLDivElement);
  }, [isScreenSharing, setupLocalScreenShare]);

  return (
    <Container>
      <ScreenTrackPlayer
        ref={(ins) => {
          shareRef.current = ins;
        }}>
        {!isScreenSharing && (
          <AgoraButton
            style={{ backgroundColor: '#000', borderColor: '#000' }}
            size="large"
            type="primary"
            onClick={startLocalScreenShare}
            width="200px">
            <SvgImg
              style={{ marginRight: '3px' }}
              type={SvgIconEnum.SHARE_SCREEN}
              colors={{ iconPrimary: '#fff' }}></SvgImg>{' '}
            {t('fcr_exam_prep_label_share_screen')}
          </AgoraButton>
        )}
      </ScreenTrackPlayer>
      <span>
        {isScreenSharing
          ? t('fcr_exam_prep_label_share_screen')
          : t('fcr_exam_prep_button_click_share_screen')}
      </span>
    </Container>
  );
});
const ScreenTrackPlayer = styled.div`
  width: 278px;
  height: 155px;
  margin: 0 auto;
  background: #f5f5f5;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
`;
const Container = styled.div`
  width: 290px;
  height: 216px;
  margin: 0 auto;
  border: 2px solid #357bf6;
  background: #fff;
  color: #000;
  font-size: 14px;
  overflow: hidden;
  padding-top: 4px;
  text-align: center;
  ${AgoraLargeBorderRadius};
  > span {
    line-height: 55px;
  }
`;
