import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  Req,
  Res,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartEntity } from './entities/cart.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { Request, Response } from 'express'; 

const CART_ID_COOKIE_NAME = 'cartId';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getCartIdFromRequest(req: Request): string | undefined {
    return req.cookies[CART_ID_COOKIE_NAME];
  }

  private setCartIdInResponse(res: Response, cartId: string): void {
    res.cookie(CART_ID_COOKIE_NAME, cartId, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 1000 * 60 * 60 * 24 * 30, 
    });
  }

  @Post('items')
  @ApiOperation({ summary: 'Adicionar um item ao carrinho ou criar um novo carrinho' })
  @ApiCookieAuth() 
  @ApiResponse({ status: 200, description: 'Item adicionado/atualizado no carrinho.', type: CartEntity })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou estoque insuficiente.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async addItem(
    @Body() addToCartDto: AddToCartDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response, 
  ): Promise<CartEntity> {
    let cartId = this.getCartIdFromRequest(req);

    const updatedCart = await this.cartService.addItemToCart(cartId, addToCartDto);

    if (!cartId || cartId !== updatedCart.id) {
      this.setCartIdInResponse(res, updatedCart.id); 
    }
    return new CartEntity(updatedCart);
  }

  @Get()
  @ApiOperation({ summary: 'Obter o carrinho atual' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Carrinho atual.', type: CartEntity })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado (ou não iniciado).' })
  async getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartEntity> {
    let cartId = this.getCartIdFromRequest(req);

    if (!cartId) {
      try {
        const newCart = await this.cartService.addItemToCart(undefined, {productId: '', quantity: 0}); 
        await this.cartService.clearCart(newCart.id); 
        this.setCartIdInResponse(res, newCart.id);
        return new CartEntity(newCart);
      } catch (error) {
         throw new NotFoundException('Nenhum carrinho ativo. Adicione um item para iniciar.');
      }
    }
    const cart = await this.cartService.getCart(cartId);
    return new CartEntity(cart);
  }

  @Get(':cartId') 
  @ApiOperation({ summary: 'Obter um carrinho específico pelo ID (mais para admin/debug)' })
  @ApiParam({ name: 'cartId', description: 'ID do Carrinho (UUID)' })
  @ApiResponse({ status: 200, description: 'Detalhes do carrinho.', type: CartEntity })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado.' })
  async getCartById(@Param('cartId', ParseUUIDPipe) cartId: string): Promise<CartEntity> {
      const cart = await this.cartService.getCart(cartId);
      return new CartEntity(cart);
  }


  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Atualizar a quantidade de um item no carrinho' })
  @ApiCookieAuth()
  @ApiParam({ name: 'itemId', description: 'ID do item do carrinho (UUID)' })
  @ApiResponse({ status: 200, description: 'Item atualizado.', type: CartEntity })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou estoque insuficiente.' })
  @ApiResponse({ status: 404, description: 'Carrinho ou item não encontrado.' })
  async updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartEntity> {
    const cartId = this.getCartIdFromRequest(req);
    if (!cartId) {
      throw new NotFoundException('Nenhum carrinho ativo. Adicione um item para iniciar.');
    }

    const updatedCart = await this.cartService.updateCartItem(cartId, itemId, updateCartItemDto);
    return new CartEntity(updatedCart);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remover um item do carrinho' })
  @ApiCookieAuth()
  @ApiParam({ name: 'itemId', description: 'ID do item do carrinho (UUID)' })
  @ApiResponse({ status: 200, description: 'Item removido.', type: CartEntity })
  @ApiResponse({ status: 404, description: 'Carrinho ou item não encontrado.' })
  async removeItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartEntity> {
    const cartId = this.getCartIdFromRequest(req);
    if (!cartId) {
      throw new NotFoundException('Nenhum carrinho ativo.');
    }
    const updatedCart = await this.cartService.removeItemFromCart(cartId, itemId);
    return new CartEntity(updatedCart);
  }

  @Delete()
  @ApiOperation({ summary: 'Limpar todos os itens do carrinho atual' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Carrinho limpo.', type: CartEntity })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado.' })
  async clearCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartEntity> {
    const cartId = this.getCartIdFromRequest(req);
    if (!cartId) {
      throw new NotFoundException('Nenhum carrinho ativo.');
    }
    const clearedCart = await this.cartService.clearCart(cartId);
    return new CartEntity(clearedCart);
  }
}