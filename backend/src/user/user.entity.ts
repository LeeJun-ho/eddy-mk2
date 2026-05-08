import { Entity, Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { IsoDateTimeType } from '@libs/database/types/iso-datetime.type';

@Entity({ comment: '사용자' })
export class User {
  @PrimaryKey({ type: 'integer', comment: 'ID' })
  id!: number;

  @Property({ unique: true, comment: '이름' })
  name!: string;

  @Property({ comment: '비밀번호 (bcrypt)' })
  password!: string;

  @Property({
    type: IsoDateTimeType,
    onCreate: () => new Date(),
    defaultRaw: 'CURRENT_TIMESTAMP',
    comment: '생성 일시',
  })
  createdAt: Opt<Date>;
}
