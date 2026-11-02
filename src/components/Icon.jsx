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
