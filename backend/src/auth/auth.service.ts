import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './types/jwt-payload.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(name: string, password: string): Promise<string> {
    const user = await this.userService.findByName(name);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('이름 또는 비밀번호가 올바르지 않습니다.');
    }

    const payload: JwtPayload = { sub: user.id, name: user.name };
    return this.jwtService.sign(payload);
  }
}
