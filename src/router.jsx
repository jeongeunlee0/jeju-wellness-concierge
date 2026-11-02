import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Concierge from './pages/Concierge'
import Places from './pages/Places'
import Heritage from './pages/Heritage'
import My from './pages/My'
import NotFound from './pages/NotFound'

// 페이지를 추가할 때: ① pages/에 파일 만들기 ② NAV_ITEMS 에 한 줄 ③ routes 에 한 줄
export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'house' },
  { to: '/concierge', label: 'AI 컨시어지', icon: 'stars' },
  { to: '/places', label: '웰니스 장소', icon: 'tree' },
  { to: '/heritage', label: '문화·유산', icon: 'bank' },
  { to: '/my', label: '저장한 코스', icon: 'bookmark-heart' },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'concierge', element: <Concierge /> },
      { path: 'places', element: <Places /> },
      { path: 'heritage', element: <Heritage /> },
      { path: 'my', element: <My /> },
    ],
  },
])
