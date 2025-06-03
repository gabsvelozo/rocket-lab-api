import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ParseOptionalIntPipe } from '../shared/pipes/parse-optional-int.pipe';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiResponse({ status: 201, description: 'O produto foi criado com sucesso.', type: ProductEntity })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos.' })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    const product = await this.productsService.create(createProductDto);
    return new ProductEntity(product);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos com filtros opcionais' })
  @ApiQuery({ name: 'name', required: false, description: 'Filtrar por nome (parcial, case-insensitive)'})
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Preço mínimo do produto' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Preço máximo do produto' })
  @ApiResponse({ status: 200, description: 'Lista de produtos.', type: [ProductEntity] })
  async findAll(
    @Query('name') name?: string,
    @Query('minPrice', ParseOptionalIntPipe) minPrice?: number,
    @Query('maxPrice', ParseOptionalIntPipe) maxPrice?: number,
  ): Promise<ProductEntity[]> {
    const products = await this.productsService.findAll(name, minPrice, maxPrice);
    return products.map(product => new ProductEntity(product));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um produto pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do produto (UUID)' })
  @ApiResponse({ status: 200, description: 'Detalhes do produto.', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductEntity> {
    const product = await this.productsService.findOne(id);
    return new ProductEntity(product);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um produto existente' })
  @ApiParam({ name: 'id', description: 'ID do produto (UUID)' })
  @ApiResponse({ status: 200, description: 'O produto foi atualizado com sucesso.', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.productsService.update(id, updateProductDto);
    return new ProductEntity(product);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um produto' })
  @ApiParam({ name: 'id', description: 'ID do produto (UUID)' })
  @ApiResponse({ status: 204, description: 'O produto foi removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}