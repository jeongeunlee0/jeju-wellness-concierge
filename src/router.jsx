import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Concierge from './pages/Concierge'
import Places from './pages/Places'
import Heritage from './pages/Heritage'
import My from './pages/My'
import Cart from './pages/Cart'
import Wellness from './pages/Wellness'
import Guestbook from './pages/Guestbook'
import Status from './pages/Status'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// 페이지를 추가할 때: ① pages/에 파일 만들기 ② NAV_ITEMS 에 한 줄 ③ routes 에 한 줄
// icon 이름은 components/Icon.jsx 의 직접 그린 아이콘 세트입니다.
export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'home' },
  { to: '/concierge', label: '코스 만들기', icon: 'spark' },
  { to: '/places', label: '장소 찾기', icon: 'leaf' },
  { to: '/heritage', label: '문화·유산', icon: 'landmark' },
  { to: '/wellness', label: '비짓제주', icon: 'compass' },
  { to: '/guestbook', label: '방명록', icon: 'book' },
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
      { path: 'wellness', element: <Wellness /> },
      { path: 'guestbook', element: <Guestbook /> },
      { path: 'status', element: <Status /> },
      { path: 'heritage', element: <Heritage /> },
      { path: 'my', element: <My /> },
      { path: 'cart', element: <Cart /> },
      { path: 'login', element: <Login /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
