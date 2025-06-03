import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from '../../products/entities/product.entity'; 

type OrderItemConstructorData = {
  id: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
  createdAt: Date;
  orderId?: string; 
  product?: Partial<ProductEntity>; 
  [key: string]: any; 
};

export class OrderItemEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string; 

  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  priceAtTime: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => ProductEntity, description: 'Detalhes do produto no item do pedido', required: false })
  product?: ProductEntity;

  constructor(partial: OrderItemConstructorData) {
    const { product: productData, ...otherItemData } = partial;
    Object.assign(this, otherItemData);

    if (productData) {
      this.product = new ProductEntity(productData);
    }
  }
}
