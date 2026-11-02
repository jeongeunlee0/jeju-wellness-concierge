// 리퀴드 글래스: 유리가 빛을 받아 일렁이는 느낌을 CSS(.glass)와 이 작은 스크립트로 만듭니다. 외부 라이브러리 없음.
//  1) 브라우저 지원을 확인해 <html> 에 glass-ok / glass-distort-ok 클래스를 붙입니다 (지원 안 하면 단색 유리로 대체)
//  2) 마우스·터치 위치를 따라 .glass 의 반짝이는 하이라이트(--mx, --my)를 움직입니다
//  3) 모션 줄이기 설정, 투명도 줄이기 설정을 존중합니다
// 어떤 환경에서도 예외를 던지지 않고, 반환된 함수로 정리(cleanup)할 수 있습니다.
export function initLiquidGlass() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}
  try {
    const root = document.documentElement
    const supports = (p) => typeof CSS !== 'undefined' && CSS.supports && (CSS.supports(p, 'blur(1px)'))
    const backdrop = supports('backdrop-filter') || supports('-webkit-backdrop-filter')
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const chromium = Boolean(navigator.userAgentData?.brands?.some((b) => /Chromium/.test(b.brand)))

    root.classList.toggle('glass-ok', backdrop)
    // SVG 굴절 필터는 backdrop-filter 에서 Chromium 계열만 지원 → 그 밖의 브라우저는 블러만
    root.classList.toggle('glass-distort-ok', backdrop && chromium && !reduceMotion)
    if (!backdrop || reduceMotion) return () => root.classList.remove('glass-ok', 'glass-distort-ok')

    let raf = 0
    let ev = null
    const move = () => {
      raf = 0
      const el = ev?.target?.closest?.('.glass')
      if (!el) return
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      el.style.setProperty('--mx', `${(((ev.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(((ev.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
    }
    const onPointer = (e) => { ev = e; if (!raf) raf = requestAnimationFrame(move) }
    document.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onPointer)
      if (raf) cancelAnimationFrame(raf)
      root.classList.remove('glass-ok', 'glass-distort-ok')
    }
  } catch {
    return () => {}   // 효과가 실패해도 앱은 계속 동작
  }
}
