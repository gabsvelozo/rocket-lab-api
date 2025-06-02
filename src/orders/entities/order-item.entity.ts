import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from '../order.entity';
import { Product } from '../../products/entities/product.entity'; 

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

  @ManyToOne(() => Product, { eager: false, onDelete: 'SET NULL', nullable: true }) 
  product: Product; 

  @Column()
  productId: string;

  @Column()
  productName: string; 
  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtPurchase: number; 
}