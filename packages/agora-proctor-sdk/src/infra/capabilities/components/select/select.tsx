import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import './style.css';
export type CommonProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: () => void;
  onKeyUp?: () => void;
  options?: { text: string; value: string }[];
  readOnly?: boolean;
  error?: string;
};
type SelectProps = CommonProps & { theme?: 'light' | 'dark' | 'auto' };

export const Select: FC<SelectProps> = ({
  placeholder,
  value = '',
  onChange = () => {},
  options = [],
  error,
  onBlur,
  theme = 'auto',
}) => {
  const [expanded, setExpanded] = useState(false);

  const selectedText = useMemo(() => {
    const selectedOption = options.find(({ value: v }) => value === v);
    return !selectedOption ? placeholder ?? '' : selectedOption.text;
  }, [value, options]);

  useEffect(() => {
    if (expanded) {
      const handler = () => {
        setExpanded(false);
      };
      document.addEventListener('mousedown', handler);
      return () => {
        document.removeEventListener('mousedown', handler);
      };
    }
  }, [expanded]);

  const handleBlur = () => {
    setExpanded(false);
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    setExpanded(true);
  };

  const optionsCls = classNames('options w-full', {
    hidden: !expanded,
  });

  const textCls = classNames('inline-block w-full flex items-center justify-between', {
    'placeholder-text': !value,
  });

  const containerCls = classNames('absolute top-0 w-full select', {
    dark: theme === 'dark',
    expand: expanded,
    error: !!error,
  });

  return (
    <div className="fcr-select relative w-full">
      <div className={containerCls}>
        <a
          className={textCls}
          style={{ padding: '14px 20px 14px 12px' }}
          href="#"
          onClick={(e) => {
            e.preventDefault();
          }}
          onMouseDown={handleFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}>
          <span className={'truncate'}>{selectedText}</span>
          <SvgImg
            type={SvgIconEnum.DOWN}
            colors={{ iconPrimary: theme === 'dark' ? '#fff' : '#030303' }}
            size={9}
            style={
              expanded
                ? { transform: 'rotate(180deg)', transition: 'all .2s' }
                : { transition: 'all .2s', transform: 'rotate(0deg)' }
            }
          />
        </a>
        <span className="error-text absolute block right-0">{error}</span>
        <div className={optionsCls}>
          {options.map(({ text, value: v }, index) => {
            const cls = classNames('option cursor-pointer', {
              selected: value === v,
            });
            return (
              <div
                key={index.toString()}
                className={cls}
                onMouseDown={() => {
                  onChange(v);
                }}>
                {text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
