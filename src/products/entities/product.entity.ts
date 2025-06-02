import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() 
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) 
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;
}