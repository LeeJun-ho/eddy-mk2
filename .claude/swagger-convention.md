# Swagger 컨벤션

## @ApiProperty 사용 규칙

- `@ApiPropertyOptional` 사용하지 않는다.
- 모든 필드에 `@ApiProperty`를 사용한다.
- 선택 필드는 `required: false`를 명시한다.
- nullable 필드는 `nullable: true`를 명시한다.

```ts
// 필수 필드
@ApiProperty({ title: '제목' })
title: string;

// 선택 필드
@ApiProperty({ title: '설명', required: false })
description?: string;

// nullable 선택 필드
@ApiProperty({ title: '설명', nullable: true, required: false })
description?: string;
```

## title 필수

- `description` 대신 `title`을 사용한다.
- 모든 `@ApiProperty`에 `title`을 포함한다.

## Response DTO

- 단건: `XxxResponseDto` — `static from(entity)` 메서드 포함
- 목록: `XxxListResponseDto` — `PaginationResponseDto<XxxResponseDto>` 상속, `static from(entities, total, page, limit)` 메서드 포함
