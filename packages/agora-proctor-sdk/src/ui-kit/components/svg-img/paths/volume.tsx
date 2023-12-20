import React from "react";

import { PathOptions } from "../svg-dict";

export const path = (props: PathOptions) => (
  <>
    <circle cx="12" cy="12" r="12" fill="#5765FF" />
    <path
      d="M7.3335 10.3605V15.4056M12.1722 7.3335V16.6668M17.3335 10.3605V15.4056"
      stroke="white"
      strokeWidth="1.86667"
      strokeLinecap="round"
    />
  </>
);

export const viewBox = "0 0 24 24";
