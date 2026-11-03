// 국가유산 카드의 사진 대신 쓰는 종류별 일러스트 (국가유산청 API는 사진 주소를 주지 않습니다)
//   보물: 보석 모양 + 반짝임 / 사적: 돌탑과 기단 / 그 밖: 기와지붕 문양
export default function HeritageArt({ kind = '' }) {
  const type = kind.includes('보물') ? 'treasure' : kind.includes('사적') ? 'site' : 'roof'
  return (
    <svg viewBox="0 0 160 120" width="160" height="120" aria-hidden="true" className="heritage-art" focusable="false">
      <ellipse cx="80" cy="104" rx="56" ry="7" fill="currentColor" opacity=".12" />
      {type === 'treasure' && (
        <g>
          <polygon points="50,46 110,46 128,66 80,100 32,66" fill="currentColor" opacity=".22" />
          <polygon points="50,46 110,46 128,66 80,100 32,66" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <polyline points="32,66 128,66" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <polyline points="50,46 66,66 80,100 94,66 110,46" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity=".6" />
          <path d="M138 24 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="currentColor" />
          <path d="M22 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="currentColor" opacity=".7" />
        </g>
      )}
      {type === 'site' && (
        <g fill="currentColor">
          <rect x="54" y="88" width="52" height="10" rx="2" opacity=".5" />
          <rect x="60" y="76" width="40" height="12" rx="2" />
          <rect x="66" y="62" width="28" height="14" rx="2" />
          <polygon points="58,62 102,62 80,48" />
          <rect x="72" y="36" width="16" height="12" rx="2" />
          <polygon points="66,36 94,36 80,24" />
          <circle cx="80" cy="16" r="3" opacity=".7" />
        </g>
      )}
      {type === 'roof' && (
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
          <path d="M26 66 Q80 30 134 66" />
          <path d="M36 66 Q80 42 124 66" opacity=".6" />
          <path d="M44 66 V92 H116 V66" />
          <path d="M70 92 V76 H90 V92" />
          <path d="M20 66 H140" />
        </g>
      )}
    </svg>
  )
}
