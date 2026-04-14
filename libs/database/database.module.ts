import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReflectMetadataProvider } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      driver: SqliteDriver,
      dbName: './data/mk2.db',
      entities: ['./dist/**/*.entity.js'],
      entitiesTs: ['./src/**/*.entity.ts'],
      metadataProvider: ReflectMetadataProvider,
      debug: process.env.NODE_ENV !== 'production',
      allowGlobalContext: true,
      schemaGenerator: {
        createForeignKeyConstraints: true,
      },
    }),
  ],
  exports: [MikroOrmModule],
})
export class DatabaseModule {}
