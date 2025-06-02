import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto'; 
import { UpdateProductDto } from './dto/update-product.dto'; 

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Cria um novo produto.
   * @param createProductDto - Dados para criar o produto.
   * @returns O produto criado.
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepository.create(createProductDto);
    return this.productRepository.save(newProduct);
  }

  /**
   * Retorna todos os produtos.
   * @returns Uma lista de todos os produtos.
   */

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  /**
   * Busca um produto específico pelo ID.
   * @param id - O ID do produto a ser buscado.
   * @returns O produto encontrado.
   * @throws NotFoundException se o produto não for encontrado.
   */

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado.`);
    }
    return product;
  }

  /**
   * Atualiza um produto existente.
   * @param id - O ID do produto a ser atualizado.
   * @param updateProductDto - Dados para atualizar o produto.
   * @returns O produto atualizado.
   * @throws NotFoundException se o produto não for encontrado.
   */

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado para atualização.`);
    }
    return this.productRepository.save(product);
  }

  /**
   * Remove um produto.
   * @param id - O ID do produto a ser removido.
   * @returns Promise<void>
   * @throws NotFoundException se o produto não for encontrado.
   */

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id); 
    await this.productRepository.remove(product);
  }
}
