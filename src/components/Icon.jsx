// 직접 그린 SVG 아이콘 세트 — 24px 격자, 1.8px 라운드 선으로 통일해 Bootstrap Icons 와 섞여 보이지 않게 했습니다.
// 사용: <Icon name="cart" size={22} />   색은 currentColor 를 따릅니다.
const P = {
  home: <path d="M4 11.2 12 4.5l8 6.7V19a1 1 0 0 1-1 1h-4.2v-5.2H9.2V20H5a1 1 0 0 1-1-1z" />,
  spark: (
    <>
      <path d="M11 3.5l1.9 5.3 5.3 1.9-5.3 1.9L11 17.9l-1.9-5.3-5.3-1.9 5.3-1.9z" />
      <path d="M18.6 15.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13.5 14-14 .4 9-5 14-13 14" />
      <path d="M5 19c2.5-4.2 5.4-7 9.5-9.2" />
    </>
  ),
  landmark: (
    <>
      <path d="M3.5 9.2 12 4l8.5 5.2z" />
      <path d="M6 10.5v7M10 10.5v7M14 10.5v7M18 10.5v7M3.5 20h17" />
    </>
  ),
  bookmark: (
    <>
      <path d="M7 4h10a1 1 0 0 1 1 1v14.6L12 16l-6 3.6V5a1 1 0 0 1 1-1z" />
      <path d="M9.4 9.6l1.9 1.9 3.4-3.6" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4.5h2.2l1.7 9.6a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.7L19.5 8H6" />
      <circle cx="9.6" cy="19" r="1.2" />
      <circle cx="16.4" cy="19" r="1.2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20c.9-3.5 3.8-5.4 7.2-5.4s6.3 1.9 7.2 5.4" />
    </>
  ),
  login: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l4 4-4 4M14 12H4" />,
  logout: <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M15 8l4 4-4 4M19 12H9" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  trash: <path d="M5 7h14M10 7V4.8h4V7M7 7l.8 12.2h8.4L17 7M10.4 11v5.2M13.6 11v5.2" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 20.5s-6.3-5.3-6.3-10.2a6.3 6.3 0 0 1 12.6 0c0 4.9-6.3 10.2-6.3 10.2z" />
      <circle cx="12" cy="10.2" r="2.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.8l7 2.6v5.2c0 4.3-2.9 7.6-7 8.9-4.1-1.3-7-4.6-7-8.9V6.4z" />
      <path d="M9 11.8l2.1 2.1 3.9-4" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h8.5M17.5 7H20M4 17h2.5M11.5 17H20" />
      <circle cx="15" cy="7" r="2.4" />
      <circle cx="9" cy="17" r="2.4" />
    </>
  ),
  cloud: <path d="M7 18.2h9.6a3.6 3.6 0 0 0 .4-7.2A5.2 5.2 0 0 0 7.2 9.8 4.2 4.2 0 0 0 7 18.2z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.6 8.4l-2 5.2-5.2 2 2-5.2z" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />,
  shirt: <path d="M8.6 4 4 6.6l2 4 2-1V20h8V9.6l2 1 2-4L15.4 4c-.4 1.4-1.9 2.3-3.4 2.3S9 5.4 8.6 4z" />,
  bag: (
    <>
      <path d="M6 8h12l1 12H5z" />
      <path d="M9 8V6.6a3 3 0 0 1 6 0V8" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17.2v.1" />
    </>
  ),
  car: (
    <>
      <path d="M5 15v-3l1.6-4.2a2 2 0 0 1 1.9-1.3h7a2 2 0 0 1 1.9 1.3L19 12v3M5 15h14v2.5H5z" />
      <circle cx="8" cy="15" r="1" />
      <circle cx="16" cy="15" r="1" />
    </>
  ),
  fork: <path d="M7 4v6a2 2 0 0 0 2 2v8M11 4v6a2 2 0 0 1-2 2M16.5 4c-1.7 1.4-2.5 3.4-2.5 6 0 1.4.8 2 2.5 2V20" />,
  cup: (
    <>
      <path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
      <path d="M16 9h1.5a2 2 0 0 1 0 4H16M6 20h10" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" />
    </>
  ),
  sunset: <path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 8V5.5M4.7 11l1.6 1.2M19.3 11l-1.6 1.2" />,
  route: (
    <>
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="18" cy="6" r="1.8" />
      <path d="M7.8 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6.2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.1" />
    </>
  ),
  phone: <path d="M6.5 4h3l1.2 3.5-2 1.3a10 10 0 0 0 5 5l1.3-2L18.5 13v3a2 2 0 0 1-2.2 2A13 13 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z" />,
  thermo: <path d="M10 14V5.5a2 2 0 0 1 4 0V14a4 4 0 1 1-4 0z" />,
  book: (
    <>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z" />
      <path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19M9 8h6M9 11h6" />
    </>
  ),
  star: <path d="M12 4l2.4 5 5.4.7-4 3.7 1 5.4L12 16l-4.8 2.8 1-5.4-4-3.7 5.4-.7z" />,
  send: <path d="M4 12 20 4l-6 16-3-6.5z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
}

export default function Icon({ name, size = 20, className = '', title }) {
  const body = P[name]
  if (!body) return null
  return (
    <svg
      className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false"
    >
      {body}
    </svg>
  )
}
