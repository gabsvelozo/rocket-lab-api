import { ApiProperty } from '@nestjs/swagger';
import { CartItemEntity } from './cart-item.entity';

export class CartEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  userId?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [CartItemEntity] })
  items: CartItemEntity[];

  @ApiProperty({ description: 'Valor total do carrinho' })
  totalAmount?: number;

  constructor(partial: Partial<CartEntity>) {
    Object.assign(this, partial);
    if (partial.items) {
      this.items = partial.items.map(item => new CartItemEntity(item));
      this.totalAmount = this.items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
    } else {
      this.items = [];
      this.totalAmount = 0;
    }
  }
}