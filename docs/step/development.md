`local/context/{{taskId}}/spec.md`와 `local/context/{{taskId}}/plan.md`를 읽고 아래 순서에 따라 개발을 진행해줘.

---

## STEP 1 — 브랜치 생성

```bash
git branch --show-current
```

- 해당 feature 브랜치가 없으면 → `git flow feature start auto-{{taskId}}`
- 이미 있으면 → `git checkout feature/auto-{{taskId}}`

---

## STEP 2 — 개발

`local/context/{{taskId}}/plan.md`의 내용을 바탕으로 코드를 작성한다.

---

## STEP 3 — 테스트 실행 및 오류 수정 반복

관련 테스트를 실행한다.

- 오류 발생 시 → 수정 후 다시 테스트 실행 (통과할 때까지 반복)
- 전체 통과 시 → 개발 단계를 완료하고 종료한다.
