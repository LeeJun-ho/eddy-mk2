Jira 티켓 {{jiraKey}}이 작업 가능한 상태인지 검증해줘.

## 절차

1. `mcp__claude_ai_Atlassian_Rovo__getJiraIssue`로 **{{jiraKey}}** 티켓을 조회한다.
2. `mcp__claude_ai_Atlassian_Rovo__atlassianUserInfo`로 현재 사용자 정보를 조회한다.

## 검증 항목

1. **역할** — `customfield_10130[0].value`가 "백엔드" 단독인지 확인 (비어 있거나 다른 값이 있으면 INVALID)
2. **컴포넌트** — Components가 비어 있지 않고, "발행사", "모집인", "관리자" 중 하나만 있는지 확인
3. **담당자** — Assignee가 현재 사용자와 일치하는지 확인
4. **진행 상태** — 상태(Status)가 "대기"와 일치하는지 확인

## 출력

모든 조건을 만족하면 마지막 줄에 백틱 없이 `VALID`를 출력해줘.
하나라도 불만족하면 불만족 항목과 이유를 설명하고 마지막 줄에 백틱 없이 `INVALID`를 출력해줘.
