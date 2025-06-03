import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, 
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Sistema de Compras API')
    .setDescription('API para gerenciamento de produtos, carrinho e pedidos.')
    .setVersion('1.0')
    .addTag('products', 'Operações relacionadas a produtos')
    .addTag('cart', 'Operações relacionadas ao carrinho de compras')
    .addTag('orders', 'Operações relacionadas a pedidos')
    .addCookieAuth('cartId', { 
        type: 'apiKey',
        in: 'cookie',
        name: 'cartId' 
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); 

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Aplicação rodando na porta: ${port}`);
  console.log(`📚 Documentação da API disponível em: http://localhost:${port}/api-docs`);
}
bootstrap();