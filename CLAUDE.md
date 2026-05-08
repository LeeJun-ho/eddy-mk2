# CLAUDE.md

@.claude/guidelines.md

---

## 주의사항

- `.env` 파일은 Read, Edit, Write, Bash 등 어떤 방법으로도 접근하지 않는다.

## 프로젝트 개요

**Eddy MK2**는 Claude Code를 자동으로 실행해 개발 작업을 처리하는 **업무 자동화 플랫폼**이다.

```
eddy-mk2/
├── backend/                  ← NestJS 배치 서버 (메인)
├── frontend/                 ← Next.js 관리 UI
└── ecosystem.config.cjs      ← PM2 설정 (루트에서 실행)
```

@backend/CLAUDE.md

## 프론트엔드 (`frontend/`)

Next.js + MUI 기반 관리 UI. (개발 예정)

## 프로덕션 실행

PM2 설정은 루트의 `ecosystem.config.cjs`를 사용한다.

```bash
# 루트 디렉토리에서 실행
pm2 start ecosystem.config.cjs
```
