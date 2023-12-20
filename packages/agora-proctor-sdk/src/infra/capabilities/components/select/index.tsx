import { Select } from 'antd';
import styled from 'styled-components';
import { AgoraMidBorderRadius } from '../common';

export const AgoraSelect = styled(Select)`
  ${AgoraMidBorderRadius}
  background: #fff;
  &.ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    height: 48px;
    ${AgoraMidBorderRadius}
  }
  &.ant-select-single.ant-select-show-arrow .ant-select-selection-item {
    line-height: 48px;
  }
`;
