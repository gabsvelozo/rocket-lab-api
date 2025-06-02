import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addItemToCart(@Body() addItemToCartDto: AddItemToCartDto) {
    return this.cartService.addItem(
      addItemToCartDto.productId,
      addItemToCartDto.quantity,
    );
  }

  @Get()
  async viewCart() {
    return this.cartService.getCart();
  }

  @Delete('item/:productId')
  async removeItemFromCart(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.cartService.removeItem(productId);
  }
  
  @Patch('item/:productId')
  async updateItemQuantity(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateCartItemQuantityDto: UpdateCartItemQuantityDto,
  ) {
    return this.cartService.updateItemQuantity(
      productId,
      updateCartItemQuantityDto.quantity,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.OK) 
  async clearCart() {
    return this.cartService.clearCart();
  }
}