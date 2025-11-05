import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

const start = async () => {
  const PORT = process.env.PORT || 8081;

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['*'] // ['http://82.202.169.113:7070']
      : true;

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Clever-home')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/v1/docs/swagger', app, document);

  await app.listen(PORT, () => console.log(`server started at ${PORT}`));
};

start();
