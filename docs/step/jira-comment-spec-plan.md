Jira 티켓 {{jiraKey}}에 요구사항과 구현 계획을 댓글로 등록해줘.

## 절차

1. `local/context/{{taskId}}/spec.md` 파일을 읽는다.
2. `local/context/{{taskId}}/plan.md` 파일을 읽는다.
3. 아래 형식으로 댓글을 작성해 `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`로 **{{jiraKey}}** 티켓에 등록한다.

## 댓글 형식

```
## 요구사항 (Spec Bot)

{spec.md 전체 내용}

---

## 구현 계획 (Plan Bot)

{plan.md 전체 내용}
```
