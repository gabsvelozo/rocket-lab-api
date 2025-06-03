import { ApiProperty } from '@nestjs/swagger';
import { OrderItemEntity } from './order-item.entity';

type PrismaOrderItemData = {
  id: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
  createdAt: Date;
  product?: { 
    id: string;
    name: string;
    price: number;
  };
  [key: string]: any; 
};

type OrderConstructorData = Omit<Partial<OrderEntity>, 'items'> & {
  items?: PrismaOrderItemData[];
};

export class OrderEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  userId?: string | null;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ example: 'PENDING', description: 'Status do pedido (PENDING, COMPLETED, CANCELED)' })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => [OrderItemEntity] })
  items: OrderItemEntity[];

  constructor(partial: OrderConstructorData) {
    const { items: prismaItems, ...otherOrderData } = partial;

    Object.assign(this, otherOrderData);

    if (prismaItems && Array.isArray(prismaItems)) {
      this.items = prismaItems.map(itemData => new OrderItemEntity(itemData));
    } else {
      this.items = [];
    }
  }
}
