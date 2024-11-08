import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const start = async () => {
  const PORT = process.env.PORT || 8081;

  const app = await NestFactory.create(AppModule);

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
