import { RefObject } from 'react';
export declare const useTabListScroll: (targetRef: RefObject<HTMLElement>, activeIndex: number | undefined) => {
    scrollLeft: import("react-spring").SpringValue<number>;
    animate: (immediate?: boolean) => void;
};
