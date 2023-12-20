import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <path
    xmlns="http://www.w3.org/2000/svg"
    d="M18.7002 23.375L14.4163 18.0202C13.9798 17.4746 14.3686 16.6667 15.0673 16.6667L24.933 16.6667C25.6317 16.6667 26.0202 17.4749 25.5837 18.0206L21.3016 23.3732C20.6344 24.2072 19.3674 24.209 18.7002 23.375Z"
    fill={props.iconPrimary || 'white'}
  />
);

export const viewBox = '0 0 40 40';
