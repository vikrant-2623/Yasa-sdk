import React from 'react';
import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <>
    <path
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.25 10.5C8.76472 10.5 6.75 12.5147 6.75 15V21C6.75 23.4853 8.76472 25.5 11.25 25.5H18.75C21.2353 25.5 23.25 23.4853 23.25 21V15C23.25 12.5147 21.2353 10.5 18.75 10.5H11.25ZM27.028 12.1943C28.0208 11.4851 29.3999 12.1948 29.3999 13.4149V22.5853C29.3999 23.8053 28.0208 24.515 27.028 23.8059L24.778 22.1987C24.3838 21.9172 24.1499 21.4626 24.1499 20.9781V15.022C24.1499 14.5376 24.3838 14.083 24.778 13.8014L27.028 12.1943Z"
      fill={props.iconPrimary || 'white'}
    />
  </>
);

export const viewBox = '0 0 36 36';
