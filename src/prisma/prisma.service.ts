import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      await this.$transaction([
        this.orderItem.deleteMany(),
        this.cartItem.deleteMany(),
        this.order.deleteMany(),
        this.cart.deleteMany(),
        this.product.deleteMany(),
      ]);
    }
  }
}