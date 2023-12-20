import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <>
    <circle cx="55" cy="55" r="43.5" fill="url(#paint0_radial_2467_44173)" stroke="#BD7E16" />
    <path
      d="M71 24C72 22.6811 73.1305 21.4372 75.6667 20.0437C78.2028 18.6502 80.6667 19.0544 82 19.0548"
      stroke="#391E08"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M41 24C40 22.6811 38.8695 21.4372 36.3333 20.0437C33.7972 18.6502 31.3333 19.0544 30 19.0548"
      stroke="#391E08"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <ellipse cx="83" cy="60.5" rx="16" ry="18.5" fill="url(#paint1_radial_2467_44173)" />
    <ellipse cx="27" cy="60.5" rx="16" ry="18.5" fill="url(#paint2_radial_2467_44173)" />
    <path
      d="M34.8897 62.5003L34.4903 62.6095C31.0502 63.5504 29.2216 67.3014 30.5993 70.591L31.7646 73.3735C35.7289 82.8393 44.9883 89 55.2506 89C65.9963 89 75.5853 82.2541 79.2159 72.1404L79.9472 70.1032C81.0542 67.0194 79.2998 63.6461 76.1394 62.7817L75.1103 62.5003C61.9452 58.8995 48.0548 58.8995 34.8897 62.5003Z"
      fill="white"
      stroke="#DE6228"
      strokeWidth="2"
    />
    <path
      d="M34 74C38.8222 74.5 49.68 75.5 54.5333 75.5C59.3867 75.5 70.8667 74.5 76 74"
      stroke="url(#paint3_linear_2467_44173)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M45 88.5V60.5H47V88.5H45ZM54 88.5V60.5H56V88.5H54ZM63 60.5V88.5H65V60.5H63ZM36 83V62H38L38 83H36ZM72 62V83H74V62H72Z"
      fill="url(#paint4_linear_2467_44173)"
    />
    <path
      d="M73.0299 43.4552C69.84 43.9182 67.3131 45.0618 65.2524 46.1027C64.522 46.4717 63.7176 45.8683 63.9655 45.0884C64.9323 42.0472 67.2294 38.1851 71.8023 37.1958C76.5994 36.158 81.7315 39.4355 83.753 42.5173C84.1738 43.1588 83.5696 43.8574 82.8121 43.7357C80.2367 43.3221 76.2884 42.9823 73.0299 43.4552Z"
      fill="#311602"
    />
    <path
      d="M38.4701 43.4552C41.66 43.9182 44.1869 45.0618 46.2476 46.1027C46.978 46.4717 47.7824 45.8683 47.5345 45.0884C46.5677 42.0472 44.2706 38.1851 39.6977 37.1958C34.9006 36.158 29.7685 39.4355 27.747 42.5173C27.3262 43.1588 27.9304 43.8574 28.6879 43.7357C31.2633 43.3221 35.2116 42.9823 38.4701 43.4552Z"
      fill="#311602"
    />
    <defs>
      <radialGradient
        id="paint0_radial_2467_44173"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(55 38) rotate(90) scale(61)">
        <stop stopColor="#FFFAE6" />
        <stop offset="0.780549" stopColor="#FBCA57" />
        <stop offset="1" stopColor="#FFB81D" />
      </radialGradient>
      <radialGradient
        id="paint1_radial_2467_44173"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(83 60.5) rotate(90) scale(18.5 16)">
        <stop stopColor="#FD6328" />
        <stop offset="1" stopColor="#FF6D29" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id="paint2_radial_2467_44173"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(27 60.5) rotate(90) scale(18.5 16)">
        <stop stopColor="#FD6328" />
        <stop offset="1" stopColor="#FF6D29" stopOpacity="0" />
      </radialGradient>
      <linearGradient
        id="paint3_linear_2467_44173"
        x1="55"
        y1="74"
        x2="55"
        y2="75.5"
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#BBB4B1" />
        <stop offset="0.510417" stopColor="#FECEB7" />
        <stop offset="1" stopColor="#9E9793" />
      </linearGradient>
      <linearGradient
        id="paint4_linear_2467_44173"
        x1="55"
        y1="60.5"
        x2="55"
        y2="88.5"
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#DE6228" />
        <stop offset="0.234375" stopColor="#FFD5C1" stopOpacity="0.765625" />
        <stop offset="1" stopColor="#FFC7AC" stopOpacity="0" />
      </linearGradient>
    </defs>
  </>
);

export const viewBox = '0 0 110 110';
