`local/context/{{taskId}}/spec.md`와 `local/context/{{taskId}}/plan.md`를 읽고 아래 순서에 따라 개발을 진행해줘.

---

## STEP 1 — 브랜치 생성

현재 브랜치를 확인한 후, 작업 내용을 기반으로 영문 kebab-case 브랜치명을 결정한다.

```bash
git branch --show-current
```

- 해당 feature 브랜치가 없으면 → `git flow feature start <브랜치명>`
- 이미 있으면 → `git checkout feature/<브랜치명>`

---

## STEP 2 — 개발

`local/context/{{taskId}}/plan.md`의 내용을 바탕으로 코드를 작성한다.

---

## STEP 3 — 테스트 실행 및 오류 수정 반복

관련 테스트를 실행한다.

- 오류 발생 시 → 수정 후 다시 테스트 실행 (통과할 때까지 반복)
- 전체 통과 시 → STEP 4로 진행

---

## STEP 4 — 커밋

`local/context/{{taskId}}/plan.md`가 위치한 프로젝트의 `.claude/commit-convention.md`에 따라 커밋한다.
변경 사항의 성격에 따라 단일 커밋 또는 여러 커밋으로 나누어도 된다.

---

## STEP 5 — develop 브랜치로 복귀

```bash
git checkout develop
```
