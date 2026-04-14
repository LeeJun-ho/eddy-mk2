import { EntityRepository, RequiredEntityData } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';


@Injectable()
export class BaseEntityRepository<
  T extends object,
> extends EntityRepository<T> {
  protected async getEntity(entityOrId: T | string | number): Promise<T> {
    if (typeof entityOrId === 'string' || typeof entityOrId === 'number') {
      return await this.findOneOrFail({ id: entityOrId } as any);
    }
    return this.merge(entityOrId);
  }

  async createAndFlush(data: RequiredEntityData<T>): Promise<T> {
    const entity: T = this.create(data);
    await this.em.persist(entity).flush();

    return entity;
  }

  async createManyAndFlush(datas: RequiredEntityData<T>[]): Promise<T[]> {
    const entities: T[] = datas.map((d) => this.create(d));
    await this.em.persist(entities).flush();

    return entities;
  }

  async update(entityOrId: T | string | number, data: Partial<T>): Promise<T> {
    const entity: T = await this.getEntity(entityOrId);
    this.assign(this.merge(entity), data as any);

    await this.em.persist(entity).flush();

    return entity;
  }

  async softDelete(entityOrId: T | string | number): Promise<void> {
    const entity: T = await this.getEntity(entityOrId);
    if ('deletedAt' in entity) {
      entity.deletedAt = new Date();
    } else if ('isDeleted' in entity) {
      entity.isDeleted = true;
    }

    await this.em.persist(entity).flush();
  }
}
