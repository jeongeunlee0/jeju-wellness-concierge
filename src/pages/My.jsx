import { useEffect, useState } from 'react'
import { Accordion, Button, Form } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import CourseResult from '../components/CourseResult'
import { Empty, Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'

// 저장한 코스 — Supabase courses 테이블에서 닉네임별로 조회 (새로고침해도 유지)
export default function My() {
  const { nickname, setNickname, courses, coursesLoading, loadCourses, deleteCourse } = useAppStore()
  const [draft, setDraft] = useState(nickname)

  useEffect(() => { loadCourses() }, [nickname, loadCourses])

  return (
    <>
      <PageHeader icon="bookmark-heart" title="저장한 코스" subtitle="로그인 없이 닉네임으로 내 코스를 불러옵니다" />
      <Form className="d-flex gap-2 mb-4" style={{ maxWidth: 380 }} onSubmit={(e) => { e.preventDefault(); setNickname(draft) }}>
        <Form.Control placeholder="닉네임" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <Button type="submit" variant="outline-primary">불러오기</Button>
      </Form>
      {coursesLoading ? <Loading /> : courses.length === 0 ? <Empty text="저장한 코스가 없어요. AI 컨시어지에서 코스를 만들어 보세요." /> : (
        <Accordion>
          {courses.map((c) => (
            <Accordion.Item eventKey={c.id} key={c.id}>
              <Accordion.Header>
                <div>
                  <div className="fw-bold">{c.summary}</div>
                  <div className="small text-muted">{new Date(c.created_at).toLocaleString('ko-KR')} · {c.preferences?.purpose} · {c.preferences?.place}</div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <CourseResult result={{ course: c.course, steps: [] }} showMap={false} />
                <Button variant="outline-danger" size="sm" className="mt-3" onClick={() => deleteCourse(c.id)}><i className="bi bi-trash me-1" />삭제</Button>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </>
  )
}
