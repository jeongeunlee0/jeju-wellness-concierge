import { useEffect } from 'react'
import { Accordion, Alert, Button } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import CourseResult from '../components/CourseResult'
import { Empty, Loading } from '../components/Status'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAppStore } from '../store/useAppStore'

// 저장한 코스 — Supabase courses 테이블에서 "내 익명 사용자"의 행만 조회 (새로고침해도 유지)
export default function My() {
  const { courses, coursesLoading, loadCourses, deleteCourse } = useAppStore()

  useEffect(() => { loadCourses() }, [loadCourses])

  return (
    <>
      <PageHeader icon="bookmark" title="저장한 코스" subtitle="이 브라우저에서 저장한 코스만 보여요" />
      <Alert variant="light" className="border small">
        <Icon name="shield" size={16} className="me-1" />로그인하지 않으면 이 브라우저의 익명 계정으로 저장돼요. <Link to="/login">로그인</Link>하면 다른 기기에서도 이어서 볼 수 있어요.
      </Alert>
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
                <CourseResult result={{ course: c.course, steps: [] }} showMap={false} purpose={c.preferences?.purpose} />
                <Button variant="outline-danger" size="sm" className="mt-3" onClick={() => deleteCourse(c.id)}><Icon name="trash" size={16} className="me-1" />삭제</Button>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </>
  )
}
