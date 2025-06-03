import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private _client: PrismaClient;

  constructor() {
    this._client = new PrismaClient();
  }

  async onModuleInit() {
    await this._client.$connect();
    console.log('Prisma Client connected (composition mode)');
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
  }

  get client(): PrismaClient {
    return this._client;
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      await this._client.$transaction([
        this._client.orderItem.deleteMany(),
        this._client.cartItem.deleteMany(),
        this._client.order.deleteMany(),
        this._client.cart.deleteMany(),
        this._client.product.deleteMany(),
      ]);
    }
  }
}