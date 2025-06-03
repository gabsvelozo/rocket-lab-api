import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseUUIDPipe,
  Req,
  Res,
  NotFoundException,
  UseGuards, 
  Patch,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderEntity } from './entities/order.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiCookieAuth, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';


const CART_ID_COOKIE_NAME = 'cartId'; 

class UpdateOrderStatusDto {
  @ApiProperty({ example: 'COMPLETED', description: 'Novo status do pedido (PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELED, REFUNDED)'})
  @IsNotEmpty()
  @IsString()
  status: string;
}


@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private getCartIdFromRequest(req: Request): string | undefined {
    return req.cookies[CART_ID_COOKIE_NAME];
  }

  private clearCartIdCookie(res: Response): void {
    res.clearCookie(CART_ID_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido a partir do carrinho atual' })
  @ApiCookieAuth() 
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.', type: OrderEntity })
  @ApiResponse({ status: 400, description: 'Carrinho vazio, estoque insuficiente ou dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado.' })
  async create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,

  ): Promise<OrderEntity> {
    const cartId = this.getCartIdFromRequest(req);
    if (!cartId) {
      throw new NotFoundException('Nenhum carrinho ativo para finalizar a compra.');
    }

    const userIdFromAuth = undefined; 

    const order = await this.ordersService.createOrderFromCart(cartId, userIdFromAuth);

    this.clearCartIdCookie(res);

    return new OrderEntity(order);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos (para admin ou usuário logado)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar pedidos por ID do usuário (para admin)'})
  @ApiResponse({ status: 200, description: 'Lista de pedidos.', type: [OrderEntity] })
  async findAll(@Query('userId') userId?: string): Promise<OrderEntity[]> {
    const orders = await this.ordersService.findAll(userId); 
    return orders.map(order => new OrderEntity(order));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pedido pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido (UUID)' })
  @ApiResponse({ status: 200, description: 'Detalhes do pedido.', type: OrderEntity })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderEntity> {
    const userIdFromAuth = undefined; 
    const order = await this.ordersService.findOne(id, userIdFromAuth);
    return new OrderEntity(order);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar o status de um pedido (para admin)'})
  @ApiParam({name: 'id', description: 'ID do pedido (UUID)'})
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Status do pedido atualizado.', type: OrderEntity})
  @ApiResponse({ status: 400, description: 'Status inválido.'})
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.'})
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    const updatedOrder = await this.ordersService.updateOrderStatus(id, body.status);
    return new OrderEntity(updatedOrder);
  }
}