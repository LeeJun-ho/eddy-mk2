import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  mkdirSync('./data', { recursive: true });

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Eddy MK2')
    .setDescription('업무 자동화 배치 서버 API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<number>('app.port', 3000));
}
bootstrap();
