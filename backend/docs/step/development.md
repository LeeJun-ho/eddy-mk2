`local/context/{{taskId}}/plan.md`를 읽고 아래 순서에 따라 개발을 진행해줘.

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

## STEP 3 — 빌드

1. `npm run lint -- --fix`를 실행해 lint 오류를 확인한다.
   - 자동 수정 후 잔여 오류가 있으면 → 수정 후 다시 실행 (통과할 때까지 반복)
2. `npm run build`를 실행해 타입 오류를 확인한다.
   - 오류 발생 시 → 수정 후 다시 빌드 (통과할 때까지 반복)
   - 빌드 통과 시 → 개발 단계를 완료하고 종료한다.
