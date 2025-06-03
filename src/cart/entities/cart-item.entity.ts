import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from '../../products/entities/product.entity';

export class CartItemEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cartId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  priceAtTime: number; 

  @ApiProperty({ type: () => ProductEntity, description: 'Detalhes do produto no item do carrinho' })
  product?: ProductEntity; 

  constructor(partial: Partial<CartItemEntity>) {
    Object.assign(this, partial);
    if (partial.product) {
      this.product = new ProductEntity(partial.product);
    }
  }
}