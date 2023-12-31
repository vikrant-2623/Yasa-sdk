export declare type Matrix = readonly [number, number, number, number, number, number];
export declare const create: () => Matrix;
export declare const getTranslateX: (m: Matrix) => number;
export declare const getTranslateY: (m: Matrix) => number;
export declare const getScaleX: (m: Matrix) => number;
export declare const getScaleY: (m: Matrix) => number;
export declare const translate: (m: Matrix, x: number, y: number) => Matrix;
export declare const scale: (m: Matrix, scaleX: number, scaleY?: number) => Matrix;
export declare const apply: (m: Matrix, [ox, oy]: [number, number]) => [number, number];
export declare const multiply: (m1: Matrix, m2: Matrix) => Matrix;
