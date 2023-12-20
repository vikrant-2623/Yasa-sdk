import { Switch, SwitchProps } from 'antd';
import React, { FC } from 'react';
export const AgoraSwitch: FC<SwitchProps> = ({ ...props }) => {
  return React.createElement(Switch, props);
};
