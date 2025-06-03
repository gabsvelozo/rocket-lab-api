// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
// Remova QueryMode da importação por enquanto
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.client.product.create({
      data: createProductDto,
    });
  }

  async findAll(name?: string, minPrice?: number, maxPrice?: number): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = {};

    // SEÇÃO DO FILTRO DE NOME TEMPORARIAMENTE COMENTADA/REMOVIDA
    // if (name) {
    //   where.name = {
    //     contains: name,
    //     // mode: QueryMode.insensitive, // ou mode: 'insensitive'
    //   };
    // }

    if (minPrice !== undefined) {
      if (!where.price) {
        where.price = {};
      }
      (where.price as Prisma.FloatFilter).gte = minPrice;
    }

    if (maxPrice !== undefined) {
      if (!where.price) {
        where.price = {};
      }
      (where.price as Prisma.FloatFilter).lte = maxPrice;
    }

    return this.prisma.client.product.findMany({ where });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.client.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);

    return this.prisma.client.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string): Promise<Product> {
    await this.findOne(id);

    return this.prisma.client.product.delete({
      where: { id },
    });
  }
}