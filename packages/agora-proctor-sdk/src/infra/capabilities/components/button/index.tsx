import { Button, ButtonProps } from 'antd';
import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import { AgoraLargeBtnBorderRadius } from '../common';

type primarySubType = 'black' | 'original' | 'red';
type AgoraButtonProps = ButtonProps &
  React.RefAttributes<HTMLElement> & {
    subType?: primarySubType;
    width?: string;
  };

const ButtonComponent: FC<AgoraButtonProps> = ({ subType, ...props }) => {
  return React.createElement(Button, props);
};

const black = css`
  background: #000;
  border-color: #000;
`;

const red = css`
  background: #f5655c;
  border-color: #f5655c;
  color: #fff;
`;

const original = css`
  background: #f8f8f8;
  border-color: #f8f8f8;
  color: #000;
`;

const selectPrimaryCss = (type: primarySubType) => {
  switch (type) {
    case 'black':
      return black;
    case 'red':
      return red;
    case 'original':
      return original;
  }
};

export const AgoraButton = styled(ButtonComponent)<AgoraButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: none;
  ${(props) =>
    props.width &&
    css`
      width: ${props.width};
    `}
  &.ant-btn-lg {
    height: 48px;
    padding-left: 30px;
    padding-right: 30px;
  }
  &.ant-btn-primary[disabled],
  .ant-btn-primary[disabled]:hover,
  .ant-btn-primary[disabled]:focus,
  .ant-btn-primary[disabled]:active {
    background: rgb(53, 123, 246);
    border-color: transparent;
    color: #fff;
    opacity: 0.5;
  }
  ${(props) => {
    switch (props.size) {
      case 'large':
        return AgoraLargeBtnBorderRadius;
      default:
        break;
    }
  }}
  ${(props) => {
    if (props.subType) {
      return css`
        &.ant-btn-primary {
          ${selectPrimaryCss(props.subType)}
        }
        &.ant-btn-primary:hover,
        &.ant-btn-primary:focus {
          ${selectPrimaryCss(props.subType)}
          opacity: 0.8;
        }
        &.ant-btn-primary:focus {
          opacity: 1;
        }
      `;
    }
  }}
`;
