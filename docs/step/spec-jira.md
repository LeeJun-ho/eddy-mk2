다음 Jira 티켓을 읽고 개발 요구사항을 정리해줘.

## 작업

제목: {{title}}
Jira 티켓 ID: {{jiraKey}}

## 절차

1. `mcp__claude_ai_Atlassian_Rovo__getJiraIssue` 툴로 Jira 티켓 **{{jiraKey}}**을 조회해줘.
2. 티켓의 Summary, Description, Acceptance Criteria, 댓글 등 모든 내용을 분석해줘.
3. 상위 이슈(Sub-task)가 있으면 함께 조회해서 전체 범위를 파악해줘.
4. 티켓의 Components 필드를 확인하고 아래 표를 참고해 작업 대상 앱 디렉토리를 파악해줘.

| Jira 컴포넌트 | apps 디렉토리     |
| ------------- | ----------------- |
| 관리자        | `admin-app`       |
| 모집인        | `recruiter-app`   |
| 발행사        | `corporation-app` |

5. 아래 요구사항 정리 항목에 따라 스펙을 작성해줘.

## 요구사항 정리 항목

1. **목적** — 이 기능이 왜 필요한지, 어떤 문제를 해결하는지
2. **기능 요구사항** — 사용자 관점에서 무엇을 할 수 있어야 하는지
3. **비즈니스 규칙** — 반드시 지켜야 할 도메인 정책과 조건
4. **예외 케이스** — 허용되지 않는 입력, 경계값, 오류 상황
5. **비기능 요구사항** — 성능, 보안, 제약 조건 등 (해당되는 경우)
6. **Jira 원문 참고** — 티켓에서 직접 인용할 만한 핵심 조건이나 검수 기준

## 출력

`local/context/{{taskId}}/spec.md` 파일이 이미 존재하면 이 단계를 건너뛰고 다음 단계로 진행해줘.
존재하지 않으면 아래 형식으로 저장하고, 반드시 파일 마지막 줄에 영문으로 `DONE`을 추가해줘.

```
## 원본 요청

**제목:** {{title}}
**Jira 티켓:** {{jiraKey}}
**대상 디렉토리:** (파악한 앱 디렉토리)
**Jira 티켓 원문:**
(Summary)

(Description)

(Acceptance Criteria)

---

## Jira 티켓 원문 요약

(Summary / Description / Acceptance Criteria 핵심 내용)

---

## 요구사항

(정리한 요구사항)
```
