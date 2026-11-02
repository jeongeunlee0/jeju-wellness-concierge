import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, ensureUser, resetUser } from '../lib/supabase'
import { planCourse } from '../api/client'

// ── 앱 전체가 함께 쓰는 상태(store) ──────────────────────
// 기본은 로그인 없이 Supabase 익명 사용자(auth.uid())별로 저장합니다. 이메일로 가입·로그인하면 같은 계정으로 어느 기기에서든 이어 쓸 수 있어요.
// Supabase 설정이 없으면 코스·장바구니를 브라우저(localStorage)에 저장해 앱이 멈추지 않게 합니다.
export const DEFAULT_PREFS = { purpose: '스트레스 해소', companion: '혼자', place: '제주시', hours: 4, env: '상관없음', note: '' }

const toUser = (u) => (u ? { id: u.id, email: u.email ?? '', isAnonymous: Boolean(u.is_anonymous) } : null)

// Supabase 영어 오류 → 사용자가 이해할 수 있는 한국어
export function authMessage(error) {
  const m = String(error?.message ?? error ?? '')
  if (/invalid login credentials/i.test(m)) return '이메일 또는 비밀번호가 맞지 않아요'
  if (/email not confirmed/i.test(m)) return '메일 인증이 아직이에요. 받은 편지함의 인증 링크를 눌러 주세요'
  if (/already (registered|been registered)|already exists/i.test(m)) return '이미 가입한 이메일이에요. 로그인해 주세요'
  if (/password.*(at least|short|weak)/i.test(m)) return '비밀번호는 8자 이상으로 입력해 주세요'
  if (/rate limit|too many/i.test(m)) return '요청이 많아요. 잠시 뒤 다시 시도해 주세요'
  if (/invalid.*email|email.*invalid/i.test(m)) return '이메일 형식을 확인해 주세요'
  return m || '알 수 없는 오류가 났어요'
}

let authSubscribed = false

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ① 사용자 표시 이름
      nickname: '',
      setNickname: (nickname) => set({ nickname: String(nickname).slice(0, 20) }),   // 입력 중 공백은 유지, 표시할 때 다듬음

      // ② 알림(토스트)
      toasts: [],
      toast: (message, variant = 'success') => {
        const id = Date.now() + Math.random()
        set({ toasts: [...get().toasts, { id, message, variant }] })
        setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2800)
      },

      // 장소 방문 가이드 패널 — { name, lat, lng, id?, type? } | null (RootLayout 의 PlaceGuideHost 가 표시)
      guidePlace: null,
      openGuide: (place) => set({ guidePlace: place }),
      closeGuide: () => set({ guidePlace: null }),

      // ③ 로그인 — { id, email, isAnonymous } | null
      user: null,
      authBusy: false,
      initAuth: async () => {
        if (!supabase) return
        try {
          set({ user: toUser(await ensureUser()) })
          if (!authSubscribed) {
            authSubscribed = true
            supabase.auth.onAuthStateChange((_event, session) => set({ user: toUser(session?.user) }))
          }
          await get().loadCart()
        } catch (e) {
          get().toast(authMessage(e), 'danger')
        }
      },
      signUp: async (email, password) => {
        if (!supabase) throw new Error('Supabase 설정이 없어 가입할 수 없어요')
        set({ authBusy: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user?.is_anonymous) {
            // 지금 쓰던 익명 계정에 이메일을 연결 → 저장한 코스·장바구니가 그대로 이어집니다
            const { data, error } = await supabase.auth.updateUser({ email, password })
            if (error) throw error
            set({ user: toUser(data.user) })
            return { needsConfirm: Boolean(data.user?.new_email) || data.user?.is_anonymous }
          }
          const { data, error } = await supabase.auth.signUp({ email, password })
          if (error) throw error
          return { needsConfirm: !data.session }
        } finally {
          set({ authBusy: false })
        }
      },
      signIn: async (email, password) => {
        if (!supabase) throw new Error('Supabase 설정이 없어 로그인할 수 없어요')
        set({ authBusy: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          set({ user: toUser(data.user), result: null })
          await Promise.all([get().loadCart(), get().loadCourses()])
        } finally {
          set({ authBusy: false })
        }
      },
      signOut: async () => {
        if (!supabase) return
        set({ authBusy: true })
        try {
          await supabase.auth.signOut()
          resetUser()
          set({ user: toUser(await ensureUser()), cart: [], courses: [], result: null })   // 새 익명 사용자로 전환
          await get().loadCart()
        } catch (e) {
          get().toast(authMessage(e), 'danger')
        } finally {
          set({ authBusy: false })
        }
      },

      // ④ 컨시어지: 입력한 선호 + 에이전트가 만든 코스 (페이지를 옮겨도 유지)
      prefs: DEFAULT_PREFS,
      setPrefs: (patch) => set({ prefs: { ...get().prefs, ...patch } }),
      result: null,           // { course, steps, generatedAt, raw }
      planning: false,
      requestCourse: async () => {
        set({ planning: true, result: null })
        try { set({ result: await planCourse(get().prefs) }) }
        catch (e) { get().toast(e.message, 'danger') }
        finally { set({ planning: false }) }
      },

      // ⑤ 저장한 코스 — Supabase courses 테이블 (설정 없으면 localStorage)
      courses: [],
      localCourses: [],
      coursesLoading: false,
      loadCourses: async () => {
        if (!supabase) return set({ courses: get().localCourses })
        set({ coursesLoading: true })
        try {
          await ensureUser()   // RLS 가 내 행만 돌려줍니다
          const { data, error } = await supabase
            .from('courses').select('*').order('created_at', { ascending: false })
          if (error) throw error
          set({ courses: data })
        } catch (e) {
          get().toast(e.message, 'danger')
        } finally {
          set({ coursesLoading: false })
        }
      },
      saveCourse: async () => {
        const { result, prefs } = get()
        if (!result?.course) return
        const row = {
          nickname: get().nickname.trim() || get().user?.email?.split('@')[0] || '익명',
          summary: result.course.summary ?? '웰니스 코스',
          preferences: prefs,
          course: result.course,
          sources: [...result.steps.map((s) => s.tool), ...(result.mode === 'rules' ? ['rules'] : [])],
        }
        if (!supabase) {
          const local = { ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() }
          set({ localCourses: [local, ...get().localCourses] })
          return get().toast('저장했어요 (이 브라우저에만 보관)')
        }
        try {
          await ensureUser()
          const { error } = await supabase.from('courses').insert(row)   // user_id 는 DB 가 auth.uid() 로 채움
          if (error) throw error
          get().toast('코스를 저장했어요')
        } catch (e) {
          get().toast(e.message, 'danger')
        }
      },
      deleteCourse: async (id) => {
        if (supabase) {
          const { error } = await supabase.from('courses').delete().eq('id', id)
          if (error) return get().toast(error.message, 'danger')
        }
        set({
          courses: get().courses.filter((c) => c.id !== id),
          localCourses: get().localCourses.filter((c) => c.id !== id),
        })
      },

      // ⑤-2 방명록 — 누구나 읽고, 로그인(익명 포함)한 사용자가 쓰고, 본인 글만 지웁니다 (Supabase guestbook + RLS)
      guestbook: [],
      guestbookCount: 0,
      guestbookLoading: false,
      loadGuestbook: async (more = false) => {
        if (!supabase) return
        set({ guestbookLoading: true })
        try {
          await ensureUser()
          const from = more ? get().guestbook.length : 0
          const { data, error, count } = await supabase.from('guestbook').select('*', { count: 'exact' })
            .order('created_at', { ascending: false }).range(from, from + 19)
          if (error) throw error
          set({ guestbook: more ? [...get().guestbook, ...data] : data, guestbookCount: count ?? data.length })
        } catch (e) {
          get().toast(e.message, 'danger')
        } finally {
          set({ guestbookLoading: false })
        }
      },
      addGuestbook: async ({ nickname, message, rating, place }) => {
        if (!supabase) throw new Error('방명록을 쓰려면 서버 설정이 필요해요')
        const row = { nickname: nickname.trim().slice(0, 20), message: message.trim().slice(0, 300), rating: rating || null, place: place?.trim() ? place.trim().slice(0, 60) : null }
        await ensureUser()
        const { data, error } = await supabase.from('guestbook').insert(row).select().single()
        if (error) {
          // 같은 사용자는 30초에 한 번만 쓸 수 있어 RLS 가 거절합니다
          if (error.code === '42501' || /row-level security/i.test(error.message)) throw new Error('방명록은 30초에 한 번만 남길 수 있어요. 잠시 뒤 다시 시도해 주세요')
          throw error
        }
        set({ guestbook: [data, ...get().guestbook], guestbookCount: get().guestbookCount + 1 })
        return data
      },
      deleteGuestbook: async (id) => {
        const { error } = await supabase.from('guestbook').delete().eq('id', id)
        if (error) return get().toast(error.message, 'danger')
        set({ guestbook: get().guestbook.filter((g) => g.id !== id), guestbookCount: Math.max(0, get().guestbookCount - 1) })
      },

      // ⑥ 장바구니 — 가고 싶은 장소를 담아 두는 곳 (예약·결제 없음). Supabase wellness_cart (설정 없으면 localStorage)
      cart: [],
      localCart: [],
      cartLoading: false,
      loadCart: async () => {
        if (!supabase) return set({ cart: get().localCart })
        set({ cartLoading: true })
        try {
          await ensureUser()
          const { data, error } = await supabase.from('wellness_cart').select('*').order('created_at', { ascending: false })
          if (error) throw error
          set({ cart: data })
        } catch (e) {
          get().toast(e.message, 'danger')
        } finally {
          set({ cartLoading: false })
        }
      },
      addToCart: async ({ name, source, addr = null, lat = null, lng = null, minutes = 60 }) => {
        if (!name) return
        if (get().cart.some((c) => c.name === name && c.source === source)) return get().toast('이미 장바구니에 있어요', 'warning')
        const row = {
          name: String(name).slice(0, 120), source, addr,
          lat: Number.isFinite(Number(lat)) && lat !== null ? Number(lat) : null,
          lng: Number.isFinite(Number(lng)) && lng !== null ? Number(lng) : null,
          minutes: Math.min(Math.max(Math.round(Number(minutes) || 60), 10), 480),
        }
        if (!supabase) {
          const local = { ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() }
          set({ localCart: [local, ...get().localCart], cart: [local, ...get().cart] })
          return get().toast('장바구니에 담았어요')
        }
        try {
          await ensureUser()
          const { data, error } = await supabase.from('wellness_cart').insert(row).select().single()
          if (error) throw error
          set({ cart: [data, ...get().cart] })
          get().toast('장바구니에 담았어요')
        } catch (e) {
          get().toast(e.code === '23505' ? '이미 장바구니에 있어요' : e.message, e.code === '23505' ? 'warning' : 'danger')
        }
      },
      removeFromCart: async (id) => {
        if (supabase) {
          const { error } = await supabase.from('wellness_cart').delete().eq('id', id)
          if (error) return get().toast(error.message, 'danger')
        }
        set({ cart: get().cart.filter((c) => c.id !== id), localCart: get().localCart.filter((c) => c.id !== id) })
      },
      clearCart: async () => {
        const ids = get().cart.map((c) => c.id)
        if (supabase && ids.length) {
          const { error } = await supabase.from('wellness_cart').delete().in('id', ids)
          if (error) return get().toast(error.message, 'danger')
        }
        set({ cart: [], localCart: [] })
      },
    }),
    {
      name: 'jeju-wellness-store',
      partialize: (s) => ({ nickname: s.nickname, prefs: s.prefs, localCourses: s.localCourses, localCart: s.localCart }),
    },
  ),
)
