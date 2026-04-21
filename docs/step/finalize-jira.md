아래 순서에 따라 마무리를 진행해줘.

---

## STEP 1 — 커밋

`.claude/commit-convention.md`에 따라 커밋한다.
변경 사항의 성격에 따라 단일 커밋 또는 여러 커밋으로 나누어도 된다.

---

## STEP 2 — Jira 티켓 상태 변경

**{{jiraKey}}** 티켓의 상태를 **"작업완료"** 로 전환한다.

1. 개발 단계에서 "진행 중"으로 변경했으므로, "진행중 → 작업완료" transition ID로 먼저 시도한다.
2. 실패하면 `mcp__claude_ai_Atlassian_Rovo__getTransitionsForJiraIssue`로 현재 상태 기준 transition 목록을 새로 조회한 뒤 "작업완료" ID로 재시도한다.

---

## STEP 3 — develop 브랜치로 복귀

```bash
git checkout develop
```
