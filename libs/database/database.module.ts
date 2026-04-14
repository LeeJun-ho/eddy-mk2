import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReflectMetadataProvider } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        driver: SqliteDriver,
        dbName: configService.get<string>('db.sqlite.path', './data/mk2.db'),
        entities: ['./dist/**/*.entity.js'],
        entitiesTs: ['./src/**/*.entity.ts'],
        metadataProvider: ReflectMetadataProvider,
        debug: configService.get<boolean>('db.debug', false),
        allowGlobalContext: true,
        schemaGenerator: {
          createForeignKeyConstraints: true,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
