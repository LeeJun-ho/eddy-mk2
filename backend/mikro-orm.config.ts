import { defineConfig, ReflectMetadataProvider, SqliteDriver } from '@mikro-orm/sqlite';
import { BaseEntityRepository } from '@libs/database/repositories/base-entity.repository';
import { Task } from 'src/task/task.entity';
import { TaskStepResult } from 'src/task/task-step-result.entity';
import { User } from 'src/user/user.entity';

export default defineConfig({
  driver: SqliteDriver,
  dbName: './data/mk2.db',
  entities: [Task, TaskStepResult, User],
  entitiesTs: ['./src/**/*.entity.ts'],
  metadataProvider: ReflectMetadataProvider,
  entityRepository: BaseEntityRepository,
  debug: process.env.DEBUG ? process.env.DEBUG.toLowerCase() === 'true' : false,
});


