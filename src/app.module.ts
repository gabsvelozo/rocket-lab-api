import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module'; 
import { CartModule } from './cart/cart.module';     
import { OrdersModule } from './orders/orders.module';  
import { Product } from './products/entities/product.entity.ts'; 
import { CartModule } from './cart/cart.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'shopping.sqlite', 
      entities: [Product /*, Cart, CartItem, Order */], 
      synchronize: true, 
    }),
    ProductsModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController, CartController],
  providers: [AppService, CartService],
})
export class AppModule {}