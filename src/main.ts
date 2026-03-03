import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/respose.interceptor';
import { TypeOrmExceptionFilter } from './common/interceptors/typeorm-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
    }
  });

  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true, // Rất quan trọng khi dùng @Query()
    },
    forbidNonWhitelisted: true
  }))
  app.useGlobalFilters(new HttpExceptionFilter(), new TypeOrmExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor());
  const port = process.env.PORT || 3000;
  await app.listen(port,'0.0.0.0');
  console.log(`🚀 http://localhost:${port}`);
}
bootstrap();
