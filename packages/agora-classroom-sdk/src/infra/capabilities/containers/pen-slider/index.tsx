import { FC, useCallback, useEffect, useState } from 'react';
import { Popover } from '@classroom/ui-kit/components/popover';
import { ASlider } from '@classroom/ui-kit/components/slider';
import { SvgIcon, SvgIconEnum, SvgImg } from '@classroom/ui-kit/components/svg-img';
import { Tooltip } from '@classroom/ui-kit/components/tooltip';
import './index.css';
import { InteractionStateColors } from '@classroom/ui-kit/utilities/state-color';
import { ToolItem } from '@classroom/ui-kit/components/toolbar/tool';
import { getPenIcon } from '@classroom/ui-kit/components/toolbar/util';
import { getPenShapeIcon } from '@classroom/ui-kit/components/pen-slider/util';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';

export interface PensProps extends ToolItem {
    pens?: string[];
    activePen?: string;
    onClick?: (value: string) => void;
    isActive?: boolean;
    colors?: string[];
    activeColor?: string;
    colorSliderMin?: number;
    colorSliderMax?: number;
    colorSliderDefault?: number;
    strokeWidthValue?: number;
    colorSliderStep?: number;
    paletteMap?: Record<string, string>;
    onColorClick?: (value: string) => void;
    onSliderChange?: (value: any) => void;
}


export const PenSliderContoller: FC<PensProps> = observer((
    {
        label,
        pens = ['pen'],
        isActive = false,
        activePen,
        onClick,
        colors = ['#7b88a0'],
        activeColor = '#7b88a0',
        colorSliderMin = 0,
        colorSliderMax = 100,
        strokeWidthValue = 5,
        colorSliderStep = 1,
        paletteMap = {},
        onColorClick,
        onSliderChange,
    }: PensProps
) => {
    const [activePenColor, setActivePenColor] = useState(activePen);
    const activePaletteColor = paletteMap[activeColor] || activeColor;
    const {
        boardUIStore,
        classroomStore: {
            remoteControlStore: { isHost },
        },
    } = useStore();
    const {
        isGrantedBoard,
        isTeacherOrAssistant,
        mounted,
    } = boardUIStore;

    const handleColorClick = (color: string) => {
        onColorClick && onColorClick(color);
    };

    const handleClick = (pen: string) => {
        onClick && onClick(pen);
    };

    const onPenClick = (pen: string) => {
        setActivePenColor(pen);
        handleClick(pen);
    };


    return isTeacherOrAssistant || isGrantedBoard ? (
        <div className="expand-tools pens colors left-tools-wrap">
            <div className="flex flex-wrap justify-between ltc-tools">
                {pens.map((pen) => {
                    const penIcon = getPenShapeIcon(pen);

                    return (
                        <div
                            key={pen}
                            className="expand-tool pen"
                            style={{ width: '21%' }}
                        >
                            <SvgIcon
                                type={penIcon}
                                hoverType={penIcon}
                                onClick={() => onPenClick(pen)}
                                colors={
                                    activePenColor === pen
                                        ? {
                                            iconPrimary: activePaletteColor,
                                        }
                                        : {}
                                }
                            />
                        </div>
                    );
                })}
            </div>

            {/* ASlider component */}
            <ASlider
                style={{ width: '100%' }}
                defaultValue={strokeWidthValue}
                value={strokeWidthValue}
                min={colorSliderMin}
                max={colorSliderMax}
                step={1} // Set the step value here
                onChange={onSliderChange}
            />

            {/* Color selection tools */}
            <div className="flex flex-wrap justify-between ltc-colors">
                {colors.map((color) => (
                    <div
                        key={color}
                        onClick={() => handleColorClick(color)}
                        className="expand-tool color"
                        style={{
                            border: activeColor === color ? `1px solid ${activePaletteColor}` : 'none',
                        }}
                    >
                        <div
                            className="circle"
                            style={{
                                backgroundColor: color,
                                border: `1px solid ${paletteMap[color] || 'transparent'}`,
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    ) : null;
});

