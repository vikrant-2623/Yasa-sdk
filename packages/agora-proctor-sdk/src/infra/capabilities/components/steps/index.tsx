import { StepProps, Steps, StepsProps } from 'antd';
import React, { FC } from 'react';
import styled, { css } from 'styled-components';

const { Step } = Steps;

const StepsComponent: FC<StepsProps> = (props) => {
  return React.createElement(Steps, props);
};

const StepComponent: FC<StepProps> = (props) => React.createElement(Step, props);
const stepBackgroundColor = css`
  background: #000;
`;

export const AgoraSteps = styled(StepsComponent)`
  &.ant-steps-dot .ant-steps-item-process .ant-steps-icon:first-child .ant-steps-icon-dot {
    ${stepBackgroundColor}
  }
  &.ant-steps-dot .ant-steps-item-icon {
    width: 8px;
    height: 8px;
  }
  &.ant-steps-dot .ant-steps-item-tail::after {
    height: 2px;
    background: #bdbec6;
  }
`;
export const AgoraStep = styled(StepComponent)`
  &.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
    ${stepBackgroundColor}
  }
  &.ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon .ant-steps-icon-dot {
    ${stepBackgroundColor}
  }
  &.ant-steps-item-finish
    > .ant-steps-item-container
    > .ant-steps-item-content
    > .ant-steps-item-description {
    color: rgba(0, 0, 0, 0.85);
  }
`;
