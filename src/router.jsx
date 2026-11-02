import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Places from './pages/Places'
import Heritage from './pages/Heritage'
import Agent from './pages/Agent'
import My from './pages/My'
import NotFound from './pages/NotFound'

export const NAV_ITEMS = [
  { to: '/', label: '웰니스 홈', icon: 'house' },
  { to: '/agent', label: 'AI 웰니스 상담', icon: 'chat-square-heart' },
  { to: '/places', label: '제주 쉼의 장소', icon: 'geo-alt' },
  { to: '/heritage', label: '문화와 휴식', icon: 'buildings' },
  { to: '/my', label: '저장한 장소', icon: 'bookmark-heart' },
]
export const router = createBrowserRouter([{path: '/', element: <RootLayout />, errorElement: <NotFound />, children: [
  {index: true, element: <Home />}, {path:'agent', element:<Agent />},
  {path:'places',element:<Places />},{path:'heritage',element:<Heritage />},
  {path:'my',element:<My />},
]}])
