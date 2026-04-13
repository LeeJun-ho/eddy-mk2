/**
 * Conventional Commits 스펙 기반 설정
 * @see https://www.conventionalcommits.org/ko/v1.0.0/
 *
 * 구조: <타입>[적용 범위(선택)]: <설명>
 *       [본문(선택)]
 *       [꼬리말(선택)]
 *
 * 적용 범위(scope) = 변경이 일어난 패키지/영역
 */

const scopes = [
  { name: 'batch', description: 'Batch' },
];
module.exports = {
  types: [
    {
      value: 'init',
      name: 'init:     처음 세팅 (보일러플레이트, 새 패키지/기능 골격)',
    },
    { value: 'feat', name: 'feat:     사용자에게 보이는 새 기능 추가 (MINOR)' },
    { value: 'fix', name: 'fix:      버그(오동작) 수정 (PATCH)' },
    { value: 'docs', name: 'docs:     README·주석·API 문서 등 문서만 수정' },
    { value: 'style', name: 'style:   동작 변경 없이 UI/스타일·포맷만 변경' },
    { value: 'refactor', name: 'refactor: 동작 그대로, 코드 구조·품질만 개선' },
    { value: 'perf', name: 'perf:     성능(메모리, 속도) 개선' },
    {
      value: 'test',
      name: 'test:     테스트 코드 추가/수정 (기능 코드 변경 없이)',
    },
    { value: 'chore', name: 'chore:   의존성·스크립트·설정 등 유지보수 작업' },
    { value: 'build', name: 'build:   빌드·배포 파이프라인, 도구 설정 변경' },
  ],
  scopes: scopes,
  scopeOverrides: {
    chore: [
      ...scopes,
      { name: 'deps', description: '의존성 추가/변경' },
      { name: 'config', description: '설정 변경' },
      { name: 'other', description: '기타' },
    ],
  },
  allowCustomScopes: true,
  allowEmptyScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  subjectSeparator: ': ',
  subjectLimit: 72,
  breaklineChar: '|',
  messages: {
    type: '타입을 선택하세요:',
    scope: '적용 범위(패키지/영역)를 선택하세요 (선택사항, empty로 생략):',
    subject: '설명을 입력하세요 (필수, 72자 이내, 마침표 사용하지 않음):\n',
    body: '본문을 입력하세요 (선택, "|"로 줄바꿈):\n',
    breaking: 'BREAKING CHANGE 설명을 입력하세요 (선택):\n',
    confirmCommit: '이 메시지로 커밋할까요?',
  },
};
