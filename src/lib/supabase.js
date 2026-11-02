import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// .env.local 을 아직 안 만들었어도 앱이 멈추지 않도록, 값이 없으면 null
export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseReady = Boolean(supabase)

// 로그인 없이 쓰는 익명 사용자: 브라우저마다 고유한 user id 를 받아 RLS 가 "내 행"만 허용합니다.
// 세션은 localStorage 에 유지되므로 새로고침해도 같은 사용자입니다.
let pending
export function ensureUser() {
  if (!supabase) return Promise.resolve(null)
  pending ??= (async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) return session.user
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw new Error(`익명 로그인 실패: ${error.message} (Supabase → Authentication → Anonymous sign-ins 확인)`)
    return data.user
  })().catch((e) => { pending = undefined; throw e })
  return pending
}
