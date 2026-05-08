# Frontend Spec — Eddy MK2

## 목표

NestJS 백엔드(포트 3000)와 분리된 Next.js 관리 UI(포트 3001).  
Task 생성/조회/삭제/재시도, 단계별 실행 결과 확인 기능 제공.  
JWT httpOnly cookie 기반 인증.

---

## 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | MUI v7 + @emotion |
| 서버 상태 | @tanstack/react-query v5 |
| 폼 | react-hook-form + zod |
| 클라이언트 상태 | zustand |
| 인증 미들웨어 | Next.js middleware (쿠키 체크) |
| 다크모드 | 미지원 (light only) |

---

## 디렉토리 구조 (FSD 패턴)

```
frontend/src/
├── app/
│   ├── layout.tsx                    # html/body, Providers 주입
│   ├── providers/
│   │   ├── Provider.tsx              # QueryClient + MUI + Emotion 통합
│   │   └── EmotionRegistry.tsx       # SSR Emotion 캐시
│   ├── theme/
│   │   └── muiTheme.ts               # createTheme (light)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   └── (admin)/
│       ├── layout.tsx                # 좌측 사이드바 레이아웃
│       ├── page.tsx                  # Task 목록 (/)
│       └── tasks/
│           └── [id]/
│               └── page.tsx          # Task 상세
├── entities/
│   ├── api/
│   │   ├── taskApi.ts                # Task CRUD + step-results
│   │   └── authApi.ts                # login / logout
│   └── model/
│       ├── task.model.ts             # Task, TaskStepResult, 관련 enum 타입
│       └── auth.model.ts             # LoginRequest
├── features/
│   ├── auth/
│   │   └── ui/
│   │       └── LoginForm.tsx
│   └── task/
│       ├── ui/
│       │   ├── TaskTable.tsx         # 목록 테이블 (필터 탭 포함)
│       │   ├── TaskCreateDialog.tsx  # 생성 다이얼로그
│       │   └── StepResultList.tsx    # 단계별 결과 아코디언
│       └── model/
│           └── useTaskQuery.ts       # useQuery / useMutation 훅 모음
└── shared/
    ├── lib/
    │   └── api/
    │       └── client.ts             # fetch 래퍼
    └── ui/
        └── common/
            └── StatusChip.tsx        # TaskStatus 컬러 칩
```

---

## 페이지 상세

### `/login`

- 필드: 이름(name), 비밀번호(password)
- 유효성: zod (required)
- 제출 → `POST /auth/login` → 성공 시 `router.replace('/')`
- 에러: "이름 또는 비밀번호가 올바르지 않습니다."
- 인증된 상태에서 접근 시 `/`로 리다이렉트

### `/` — Task 목록

- 상단: 상태 필터 탭 (전체 / PENDING / RUNNING / DONE / FAILED)
- 우상단: "작업 추가" 버튼 → `TaskCreateDialog`
- MUI `DataGrid` 또는 `Table`:

| 컬럼 | 내용 |
|------|------|
| ID | number |
| 제목 | string |
| 타입 | TaskType (SIMPLE / DEVELOPMENT / CODE_REVIEW) |
| 상태 | StatusChip |
| 우선순위 | 1–5 |
| 현재 단계 | TaskStep 또는 — |
| 생성 일시 | 날짜 포맷 |
| 액션 | 상세보기 / 재시도(FAILED) / 삭제 |

- 행 클릭 → `/tasks/[id]`

**TaskCreateDialog 필드:**

| 필드 | 타입 | 필수 |
|------|------|------|
| title | string | ✓ |
| type | select (TaskType) | ✓ |
| priority | select (1–5) | ✓ |
| description | textarea | |
| jiraKey | string | |
| enableCodeReview | checkbox | |

### `/tasks/[id]` — Task 상세

**상단 메타 카드:**
- 제목, 상태(StatusChip), 타입, 우선순위
- jiraKey (있으면 표시)
- 생성/시작/완료 일시
- failCount > 0이면 경고 표시
- FAILED 상태면 "재시도" 버튼

**단계별 결과 (`StepResultList`):**
- 각 단계를 MUI Accordion으로 표시
- 헤더: 단계명 + 성공/실패 아이콘 + createdAt
- 내용:
  - content가 있으면 마크다운 코드블록으로 표시
  - stdout이 있으면 토글 가능한 로그 영역

---

## API 클라이언트

백엔드 전역 응답 형태: `{ success: boolean, data: T }`

```typescript
// shared/lib/api/client.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    credentials: 'include',   // httpOnly cookie 자동 전송
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const body: ApiResponse<T> = await res.json();
  return body.data;
}
```

---

## 인증 흐름

```
미인증 요청
  → middleware.ts: access_token 쿠키 없음 → redirect /login

POST /auth/login
  → 성공: 백엔드가 Set-Cookie: access_token=...; HttpOnly; SameSite=Lax
  → 클라이언트: router.replace('/')

POST /auth/logout
  → 백엔드: clearCookie
  → 클라이언트: router.replace('/login')
```

---

## 환경변수

```
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 백엔드 추가 작업 (선행 필요)

| 항목 | 내용 |
|------|------|
| TransformInterceptor | 전역 `{ success, data }` 래퍼 |
| User 엔티티 | id, name, password (bcrypt) |
| POST /auth/login | JWT → httpOnly cookie |
| POST /auth/logout | clearCookie |
| JwtAuthGuard | 전역, @Public() 예외 |
| GET /tasks/:id/step-results | TaskStepResultService.findByTaskId 이용 |
| CORS | origin: localhost:3001, credentials: true |
| cookie-parser | main.ts에 추가 |

---

## PM2 추가 (ecosystem.config.cjs)

```javascript
{
  name: 'eddy-mk2-frontend',
  script: 'node_modules/.bin/next',
  args: 'start',
  cwd: require('path').join(__dirname, 'frontend'),
  env: { NODE_ENV: 'production', PORT: 3001 },
}
```
