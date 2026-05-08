import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BaseEntityRepository } from '@libs/database/repositories/base-entity.repository';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: BaseEntityRepository<User>,
  ) {}

  findByName(name: string): Promise<User | null> {
    return this.userRepository.findOne({ name });
  }
}
