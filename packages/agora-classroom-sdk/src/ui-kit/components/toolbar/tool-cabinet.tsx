import { FC } from 'react';
import { Popover } from '@classroom/ui-kit/components/popover';
import { Tooltip } from '@classroom/ui-kit/components/tooltip';
import { SvgImg, SvgIcon, SvgIconEnum } from '@classroom/ui-kit/components/svg-img';
import { InteractionStateColors } from '@classroom/ui-kit/utilities/state-color';

export interface ToolCabinetProps {
  label: string;
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

export const ToolCabinet: FC<ToolCabinetProps> = ({
  label,
  children,
  visible,
  onVisibilityChange,
}) => {
  const content = () => <div className={`expand-tools tool-cabinet`}>{children}</div>;

  return (
    <Tooltip
      title={label}
      placement="top"
      overlayClassName="translated-tooltip"
      mouseLeaveDelay={0}>
      <Popover
        visible={visible}
        onVisibleChange={onVisibilityChange}
        overlayClassName="dark-popup"
        trigger="hover"
        content={content}
        placement="top">
        <div className="tool">
          <SvgIcon
            type={SvgIconEnum.TOOLS}
            hoverType={SvgIconEnum.TOOLS}
            hoverColors={{ iconPrimary: InteractionStateColors.allow }}
          />
          <SvgImg size={6} type={SvgIconEnum.TRIANGLE_DOWN} className="triangle-icon" />
        </div>
      </Popover>
    </Tooltip>
  );
};
