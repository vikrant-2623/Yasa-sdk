import { FC } from 'react';
import './index.css';
export const VolumeIndicator: FC = () => {
  return (
    <div className={'volume-indicator'}>
      <div className="indicator-1"></div>
      <div className="indicator-2"></div>
      <div className="indicator-3"></div>
    </div>
  );
};
