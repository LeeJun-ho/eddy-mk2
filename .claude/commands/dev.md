---
description: 요청사항을 받아 브랜치 생성 → 요구사항 정리 → 계획 수립 → 개발 → 테스트 → 커밋 → develop 복귀까지 전체 개발 워크플로우 자동
---

# 개발 워크플로우

요청사항: **$ARGUMENTS**

---

## STEP 1 — 브랜치 생성

현재 브랜치를 확인한 후, `$ARGUMENTS`를 기반으로 영문 kebab-case 브랜치명을 결정한다.

```bash
git branch --show-current
```

- 해당 feature 브랜치가 없으면 → `git flow feature start <브랜치명>`
- 이미 있으면 → `git checkout feature/<브랜치명>`

---

## STEP 2 — Spec

`$ARGUMENTS`를 바탕으로 구현 명세를 작성한다.

- 무엇을 만들어야 하는지 (기능 범위)
- 어떤 제약 조건이 있는지 (예외 처리, 비즈니스 규칙)

작성한 내용을 `context/<브랜치명>/spec.md`에 저장한다.

---

## STEP 3 — Plan

구현 명세를 바탕으로 변경할 파일과 함수를 계획한다.

- 어떤 파일을 생성/수정할지
- 함수/클래스 단위로 변경 내용 정리

작성한 내용을 `context/<브랜치명>/plan.md`에 저장한다.

---

## STEP 4 — 개발

Plan을 바탕으로 코드를 작성한다.

---

## STEP 5 — 테스트 실행 및 오류 수정 반복

관련 테스트를 실행한다.

- 오류 발생 시 → 수정 후 다시 테스트 실행 (통과할 때까지 반복)
- 전체 통과 시 → STEP 6으로 진행

---

## STEP 6 — 커밋

@.claude/commit-convention.md 에 따라 커밋한다. 변경 사항의 성격에 따라 단일 커밋 또는 여러 커밋으로 나누어도 된다.

---

## STEP 7 — develop 브랜치로 복귀

```bash
git checkout develop
```

---
