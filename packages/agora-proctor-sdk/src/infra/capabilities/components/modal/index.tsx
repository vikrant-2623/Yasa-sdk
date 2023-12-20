import { Modal } from 'antd';
import styled, { css } from 'styled-components';

const modalBorderRadius = css`
  border-radius: 16px;
`;

export const AgoraModal = styled(Modal)<{ placement?: 'bottom' }>`
  box-shadow: -1px 10px 60px rgba(0, 0, 0, 0.12);
  /* background: radial-gradient(483.9% 2719.65% at -49.5% -250%, rgba(215, 152, 225, 0.8) 17.55%, rgba(155, 255, 165, 0.8) 27.56%, rgba(174, 211, 255, 0.8) 49.89%, rgba(201, 212, 239, 0.8) 56.53%, rgba(202, 207, 250, 0.8) 65.69%); */
  background: url(${require('./assets/modal-bg.svg')}) no-repeat top center / cover;
  background-color: #fff;
  ${modalBorderRadius}
  ${(props) =>
    props.placement === 'bottom' &&
    css`
      &.ant-modal {
        vertical-align: bottom;
      }
    `}
  & .ant-modal-body {
    padding: 0;
  }
  & .ant-modal-content {
    background: transparent;
    ${modalBorderRadius}
  }
  & .ant-modal-header {
    ${modalBorderRadius}
    background: transparent;
  }
  & .ant-modal-footer {
    height: 100px;
    box-sizing: border-box;
    padding: 0 49px;
  }
  & .ant-modal-close-x {
    width: 40px;
    height: 40px;
    background: rgba(138, 138, 138, 0.1);

    backdrop-filter: blur(25px);
    /* Note: backdrop-filter has minimal browser support */

    border-radius: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
    margin-top: 12px;
  }
`;
