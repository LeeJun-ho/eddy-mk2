import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  @ApiProperty({ title: '전체 개수', example: 1 })
  total: number;

  @ApiProperty({ title: '페이지 번호', example: 1 })
  page: number;

  @ApiProperty({ title: '페이지 당 개수', example: 20 })
  limit: number;

  @ApiProperty({ title: '조회 대상 배열' })
  items: Partial<T>[];
}
