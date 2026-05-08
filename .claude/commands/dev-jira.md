---
description: Jira 티켓 번호를 받아 브랜치 생성 → 상태 "진행 중" → 개발 → 테스트 → 커밋 → 상태 "작업완료" → develop 복귀까지 전체 개발 워크플로우 자동 실행. 예: "/dev-jira VL-542"
argument-hint: "<Jira 티켓 번호>"
---

# 개발 워크플로우

Jira 티켓: **$ARGUMENTS**

---

## STEP 1 — Jira 티켓 읽기

`$ARGUMENTS` 티켓을 조회해 summary, description, components를 확인한다.
컴포넌트로 작업 대상 앱 디렉토리를 파악한다.

| Jira 컴포넌트 | apps 디렉토리     |
| ------------- | ----------------- |
| 관리자        | `admin-app`       |
| 모집인        | `recruiter-app`   |
| 발행사        | `corporation-app` |

---

## STEP 2 — 브랜치 생성

현재 브랜치를 확인한 후 `feature/$ARGUMENTS` 브랜치가 없으면 생성하고, 있으면 체크아웃한다.
브랜치 생성 시 반드시 git flow를 사용한다.

```bash
git branch --show-current
```

- `feature/$ARGUMENTS`가 없으면 → `git flow feature start $ARGUMENTS`
- `feature/$ARGUMENTS`가 이미 있으면 → `git checkout feature/$ARGUMENTS`

---

## STEP 3 — Jira 티켓 상태 변경

`$ARGUMENTS` 티켓의 진행 상태를 **"진행 중"** 으로 전환한다.

---

## STEP 4 — Spec

티켓의 summary, description을 바탕으로 구현 명세를 작성한다.

- 무엇을 만들어야 하는지 (기능 범위)
- 어떤 제약 조건이 있는지 (예외 처리, 비즈니스 규칙)

작성한 내용을 `context/$ARGUMENTS/spec.md`에 저장한다.

---

## STEP 5 — Plan

구현 명세를 바탕으로 변경할 파일과 함수를 계획한다.

- 어떤 파일을 생성/수정할지
- 함수/클래스 단위로 변경 내용 정리

작성한 내용을 `context/$ARGUMENTS/plan.md`에 저장한다.

---

## STEP 6 — 개발

Plan을 바탕으로 코드를 작성한다.

---

## STEP 7 — 테스트 실행 및 오류 수정 반복

관련 테스트를 실행한다.

- 오류 발생 시 → 수정 후 다시 테스트 실행 (통과할 때까지 반복)
- 전체 통과 시 → STEP 8으로 진행

---

## STEP 8 — 커밋

@.claude/commit-convention.md 에 따라 커밋한다. 변경 사항의 성격에 따라 단일 커밋 또는 여러 커밋으로 나누어도 된다.

```
<타입>(<스코프>): <설명>

JIRA: $ARGUMENTS
```

---

## STEP 9 — Jira 티켓 상태 변경

`$ARGUMENTS` 티켓의 진행 상태를 **"작업완료"** 로 전환한다.

1. STEP 3에서 "진행 중"으로 변경했으므로, "진행중 → 작업완료" transition ID로 먼저 시도한다.
2. 실패하면 `getTransitionsForJiraIssue`로 현재 상태 기준 transition 목록을 새로 조회한 뒤 "작업완료" ID로 재시도한다.

---

## STEP 10 — develop 브랜치로 복귀

```bash
git checkout develop
```

---
