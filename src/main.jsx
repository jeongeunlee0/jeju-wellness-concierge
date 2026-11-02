import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

// ── 디자인 ───────────────────────────────────────────────
// Bootstrap 5 + Bootswatch 테마. 아래 'minty' 한 단어만 바꾸면 앱 전체 디자인이 바뀝니다.
// zephyr(부드러운 파스텔 톤) — 웰니스의 차분한 분위기에 맞춰 선택
// 테마 미리보기: https://bootswatch.com
import 'bootswatch/dist/zephyr/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/theme.css'
import './styles/glass.css'

import { router } from './router'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
