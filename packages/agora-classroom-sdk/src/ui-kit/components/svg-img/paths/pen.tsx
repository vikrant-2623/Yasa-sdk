import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => 
<>
<mask id="mask0_1527_4393" maskUnits="userSpaceOnUse" x="0" y="0" width="31" height="31">
<rect x="0.0975342" y="0.96875" width="30" height="30" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_1527_4393)">
<path
    fill={props.iconPrimary}
    d="M24.2225 12.125L18.91 6.875L20.66 5.125C21.1392 4.64583 21.7277 4.40625 22.4257 4.40625C23.1236 4.40625 23.7121 4.64583 24.1913 5.125L25.9413 6.875C26.4205 7.35417 26.6705 7.93229 26.6913 8.60938C26.7121 9.28646 26.483 9.86458 26.0038 10.3438L24.2225 12.125ZM22.41 13.9688L9.16003 27.2188H3.84753V21.9062L17.0975 8.65625L22.41 13.9688Z"
/>
</g>
</>

export const viewBox = '0 0 31 31';