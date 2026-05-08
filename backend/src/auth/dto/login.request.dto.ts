import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ title: '이름', example: 'eddy' })
  name!: string;

  @ApiProperty({ title: '비밀번호' })
  password!: string;
}
