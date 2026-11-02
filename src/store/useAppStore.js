import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, ensureUser } from '../lib/supabase'
import { planCourse } from '../api/client'

// ── 앱 전체가 함께 쓰는 상태(store) ──────────────────────
// 로그인 없이 Supabase 익명 사용자(auth.uid())별로 저장합니다. 닉네임은 표시용 이름일 뿐 접근 키가 아닙니다.
// Supabase 설정이 없으면 코스를 브라우저(localStorage)에 저장해 앱이 멈추지 않게 합니다.
export const DEFAULT_PREFS = { purpose: '스트레스 해소', companion: '혼자', place: '제주시', hours: 4, env: '상관없음', note: '' }

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ① 사용자
      nickname: '',
      setNickname: (nickname) => set({ nickname: nickname.trim() }),

      // ② 알림(토스트)
      toasts: [],
      toast: (message, variant = 'success') => {
        const id = Date.now() + Math.random()
        set({ toasts: [...get().toasts, { id, message, variant }] })
        setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2500)
      },

      // ③ 컨시어지: 입력한 선호 + 에이전트가 만든 코스 (페이지를 옮겨도 유지)
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

      // ④ 저장한 코스 — Supabase courses 테이블 (설정 없으면 localStorage)
      courses: [],
      localCourses: [],
      coursesLoading: false,
      loadCourses: async () => {
        if (!supabase) return set({ courses: get().localCourses })
        set({ coursesLoading: true })
        try {
          await ensureUser()   // 익명 사용자 — RLS 가 내 행만 돌려줍니다
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
          nickname: get().nickname || '익명',
          summary: result.course.summary ?? '웰니스 코스',
          preferences: prefs,
          course: result.course,
          sources: result.steps.map((s) => s.tool),
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
    }),
    {
      name: 'jeju-wellness-store',
      partialize: (s) => ({ nickname: s.nickname, prefs: s.prefs, localCourses: s.localCourses }),
    },
  ),
)
