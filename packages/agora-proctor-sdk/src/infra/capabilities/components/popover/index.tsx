import { Popover, PopoverProps } from 'antd';
import React, { FC } from 'react';
export const AgoraPopover: FC<PopoverProps> = ({ ...props }) => {
  return React.createElement(Popover, props);
};
