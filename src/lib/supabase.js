import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// .env.local 을 아직 안 만들었어도 앱이 멈추지 않도록, 값이 없으면 null
export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseReady = Boolean(supabase)

let pendingSession
export async function ensureUser() {
  if (!supabase) throw new Error('Supabase 연결 설정이 필요합니다.')
  if (!pendingSession) pendingSession = (async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (data.session) return data.session.user
    const response = await supabase.auth.signInAnonymously()
    if (response.error) throw response.error
    return response.data.user
  })().catch(error => { pendingSession = null; throw error })
  return pendingSession
}
