import { Tabs, TabsProps } from 'antd';
import React, { FC } from 'react';
export const AgoraTabs: FC<TabsProps> = ({ ...props }) => {
  return React.createElement(Tabs, props);
};
