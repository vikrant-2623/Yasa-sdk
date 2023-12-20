import { Segmented, SegmentedProps } from 'antd';
import React, { FC } from 'react';
export const AgoraSegmented: FC<SegmentedProps & React.RefAttributes<HTMLDivElement>> = ({
  ...props
}) => {
  return React.createElement(Segmented, props);
};
