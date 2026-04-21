Jira 티켓 {{jiraKey}}에 코드 리뷰 결과를 댓글로 등록해줘.

## 절차

1. `mcp__claude_ai_Atlassian_Rovo__getJiraIssue`로 **{{jiraKey}}** 티켓의 기존 댓글을 조회한다.
2. 기존 댓글 중 `코드 리뷰 결과 (Code-Review Bot)` 텍스트를 포함하는 댓글이 있으면 이미 등록된 것으로 간주하고 `SKIPPED`를 출력한 후 작업을 종료한다.
3. `local/context/{{taskId}}/code-review.md` 파일을 읽는다.
4. 아래 형식으로 댓글을 작성해 `mcp__claude_ai_Atlassian_Rovo__addCommentToJiraIssue`로 **{{jiraKey}}** 티켓에 등록한다.

## 댓글 형식

```
## 코드 리뷰 결과 (Code-Review Bot)

{code-review.md 전체 내용}
```
