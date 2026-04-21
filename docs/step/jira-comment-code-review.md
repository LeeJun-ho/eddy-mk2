Jira 티켓 {{jiraKey}}에 코드 리뷰 결과를 댓글로 등록해줘.

## 절차

1. `local/context/{{taskId}}/code-review.md` 파일을 읽는다.
2. 아래 형식으로 댓글을 작성해 `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`로 **{{jiraKey}}** 티켓에 등록한다.

## 댓글 형식

```
## 코드 리뷰 결과 (Code-Review Bot)

{code-review.md 전체 내용}
```
