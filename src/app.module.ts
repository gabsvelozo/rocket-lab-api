import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity'; 
import { OrderItem } from './orders/entities/order-item.entity'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'shopping.sqlite',
      entities: [Product, Order, OrderItem], 
      synchronize: true, 
    }),
    ProductsModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController], 
  providers: [AppService],    
})
export class AppModule {}