import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { planCourse } from '../api/client'

// ── 앱 전체가 함께 쓰는 상태(store) ──────────────────────
// 로그인이 없으므로 "닉네임"을 저장·조회 키로 씁니다. (MVP 범위: 로그인 제외)
// Supabase 설정이 없으면 코스를 브라우저(localStorage)에 저장해 데모가 멈추지 않게 합니다.
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
        const nick = get().nickname || '익명'
        if (!supabase) return set({ courses: get().localCourses.filter((c) => c.nickname === nick) })
        set({ coursesLoading: true })
        const { data, error } = await supabase
          .from('courses').select('*').eq('nickname', nick).order('created_at', { ascending: false })
        set({ coursesLoading: false })
        if (error) return get().toast(error.message, 'danger')
        set({ courses: data })
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
        const { error } = await supabase.from('courses').insert(row)
        if (error) return get().toast(error.message, 'danger')
        get().toast('코스를 저장했어요')
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
