import Slider, { SliderSingleProps } from 'antd/lib/slider';
import classnames from 'classnames';
import React, { FC, useState, useEffect, useRef }  from 'react';
import { BaseProps } from '@classroom/ui-kit/components/util/type';
import './index.css';

type tooltipPositionProps = 'top' | 'bottom' | '';
export interface ASliderProps extends BaseProps {
  defaultValue?: number;
  value?: number;
  disabled?: boolean;
  max?: number;
  min?: number;
  step?: number;
  tooltipPosition?: tooltipPositionProps;
  onChange?: (value: number) => void;
}

export const ASlider: FC<ASliderProps & Pick<SliderSingleProps, 'vertical'>> = ({
  defaultValue = 0,
  value = 0,
  disabled = false,
  max = 100,
  min = 0,
  step = 1,
  tooltipPosition = 'bottom',
  onChange = (value: number) => {
    alert(value)
    console.log(value, 'valueeee');
  },
  className,
  vertical,
  ...restProps
}) => {

  console.log(value, 'value')
  const cls = classnames({
    [`fcr-theme`]: 1,
    [`slider`]: 1,
    [`${className}`]: !!className,
  });

  const [strokeValue, setStrokeValue] = useState<Number>(2)

  const onHandleToolClick = (value:number) => {
    setStrokeValue(value)
  };

  useEffect(()=> {
    console.log(strokeValue, 'strokeValue')
  },[strokeValue])


  return (
    <div className={cls} {...restProps}>
      <div className="flex flex-wrap justify-between ltc-pen-size">
        <div className={strokeValue === 5 ? 'expand-tool pen-size p_size_5 stroke-active' : 'expand-tool pen-size p_size_5'  } onClick={() => { onChange(5); onHandleToolClick(5) }}></div>
        <div className={strokeValue === 4 ? 'expand-tool pen-size p_size_4 stroke-active' : 'expand-tool pen-size p_size_4'  } onClick={() => { onChange(4); onHandleToolClick(4) }}></div>
        <div className={strokeValue === 3 ? 'expand-tool pen-size p_size_3 stroke-active' : 'expand-tool pen-size p_size_3'  } onClick={() => { onChange(3); onHandleToolClick(3) }}></div>
        <div className={strokeValue === 2 ? 'expand-tool pen-size p_size_2 stroke-active' : 'expand-tool pen-size p_size_2'  } onClick={() => { onChange(2); onHandleToolClick(2) }}></div>
        <div className={strokeValue === 1 ? 'expand-tool pen-size p_size_1 stroke-active' : 'expand-tool pen-size p_size_1'  } onClick={() => { onChange(1); onHandleToolClick(1) }}></div>
      </div>
    </div>
    // <div className={cls} {...restProps}>
    //   <Slider
    //     defaultValue={defaultValue}
    //     value={value}
    //     disabled={disabled}
    //     max={max}
    //     min={min}
    //     step={step}
    //     vertical={vertical}
    //     onChange={onChange}
    //   />
    // </div>
  );
};
