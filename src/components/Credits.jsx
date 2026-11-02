// 외부 서비스 출처 표기 (Pixabay 약관: 이미지 출처 표시 권장 / 사진은 장소 실사가 아님을 명시)
export function PixabayCredit({ className = '' }) {
  return (
    <span className={`credit ${className}`}>
      <i className="bi bi-image me-1" />분위기 참고 이미지 ·{' '}
      <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer">Pixabay</a>
    </span>
  )
}

export function VisitJejuLink({ children = '비짓제주에서 더 보기', className = '' }) {
  return (
    <a className={`btn btn-sm btn-outline-primary ${className}`} href="https://www.visitjeju.net/kr" target="_blank" rel="noopener noreferrer">
      <i className="bi bi-box-arrow-up-right me-1" />{children}
    </a>
  )
}
