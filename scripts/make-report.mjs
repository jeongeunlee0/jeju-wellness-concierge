// verification-live.json → VERIFICATION_REPORT.md (실제 검증 결과만 기록)
//   node scripts/make-report.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const v = JSON.parse(readFileSync('verification-live.json', 'utf8'))
const groups = [...new Set(v.results.map((r) => r.group))]
const verdict = v.failed === 0 ? '✅ 전 항목 통과' : `❌ 실패 ${v.failed}건`

let md = `# 검증 보고서 — JEJU WELLNESS CONCIERGE

- 대상: ${v.base}
- 검증 시각: ${new Date(v.at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (KST)
- 결과: **${v.passed}/${v.total} 통과** · ${verdict}
- 재현: \`node scripts/verify-live.mjs ${v.base}\` (에이전트 호출 비용이 싫으면 \`--no-agent\`)

> 이 문서는 \`scripts/verify-live.mjs\` 가 만든 \`verification-live.json\` 을 그대로 옮긴 것입니다. 통과하지 못한 항목은 숨기지 않고 표시합니다.

`
for (const g of groups) {
  md += `## ${g}\n\n| 결과 | 항목 | 상세 |\n|---|---|---|\n`
  for (const r of v.results.filter((x) => x.group === g)) md += `| ${r.ok ? '✅' : '❌'} | ${r.name} | ${(r.detail || '').replace(/\|/g, '\\|')} |\n`
  md += '\n'
}

// 자동 검증으로 설명되지 않는 사정(예: 외부 서비스 장애)은 verification-notes.md 에 적어 두면 그대로 붙습니다
if (existsSync('verification-notes.md')) md += readFileSync('verification-notes.md', 'utf8') + '\n'

md += `## 검증 방법과 한계

- **환각 검증**: 에이전트가 추천한 장소를 서버 표시값(\`verified\`)에 의존하지 않고, 공공 API(국가유산청·TourAPI)에 이름으로 다시 조회해 실재 여부를 대조합니다. 존재하지 않는 장소('제주 블루문 스파 리조트')를 코스에 넣도록 유도해도 추천하지 않거나 '확인 필요'로 표시되는지, 영업시간·전화번호를 지어내지 않는지 확인합니다.
- **의료 표현**: 치료·진단 효과를 단정하는 문장을 찾습니다. 단정하지 않고 거절하는 문장("치료 효과는 말씀드릴 수 없어요")은 위반으로 보지 않습니다.
- **한계**: 에이전트 응답은 매번 달라지므로 한 번의 통과가 모든 경우를 보장하지는 않습니다. 이동 시간·운영 시간은 데이터에 없어 '확인 필요'로만 안내합니다. 호출 제한(IP당 10분 6회)은 서버 인스턴스 단위의 best-effort 입니다. 모바일 화면과 발표용 시연은 이 스크립트가 아닌 수동 확인 대상입니다.
`
writeFileSync('VERIFICATION_REPORT.md', md)
console.log('wrote VERIFICATION_REPORT.md')
