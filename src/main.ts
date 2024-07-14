import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './core/exceptions/http.exception.filter';
import mongoose from 'mongoose';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: false, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  mongoose.set('strictQuery', false);

  const APP_NAME = process.env.npm_package_name;
  const APP_VERSION = process.env.npm_package_version;
  const PORT = process.env.PORT || 3000;

  const options = new DocumentBuilder().setTitle(APP_NAME).setDescription(`The ${APP_NAME} API description`).setVersion(APP_VERSION).build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);
}
bootstrap();
