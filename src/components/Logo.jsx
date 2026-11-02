import { useId } from 'react'

// 브랜드 마크: 바다색→세이지 그라데이션 위의 잎 + 물결. public/favicon.svg 와 같은 도형입니다.
export default function Logo({ size = 34, withText = true }) {
  const id = useId().replace(/:/g, '')
  return (
    <span className="logo d-inline-flex align-items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="JEJU WELLNESS CONCIERGE 로고">
        <defs>
          <linearGradient id={`g${id}`} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4fb3c8" />
            <stop offset="1" stopColor="#8cc9a0" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill={`url(#g${id})`} />
        <path d="M14 31c0-9 6-15 17-15.5C31.5 26 25 31.5 16 31.5" fill="#fff" fillOpacity=".95" />
        <path d="M14 31c3-4.6 6.6-7.7 11.5-10" fill="none" stroke="#4fb3c8" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 37.5c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      {withText && <span className="logo-text">JEJU WELLNESS<br className="d-none" /> CONCIERGE</span>}
    </span>
  )
}
