import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set API Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Wanderlust Travel & Hospitality API')
    .setDescription('Enterprise Full Stack API for Hotels, Cab Bookings, Authentication and Admin Dashboard')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Hotels')
    .addTag('Cab Booking')
    .addTag('Bookings Pipeline')
    .addTag('Banners & Hero Section')
    .addTag('Admin Dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Wanderlust Enterprise Backend API running at: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
