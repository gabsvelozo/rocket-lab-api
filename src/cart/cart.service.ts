import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart, CartItem, Product } from '@prisma/client';

type CartWithDetails = Cart & {
  items: (CartItem & {
    product: Product;
  })[];
};

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  private async findOrCreateCart(cartId?: string, userId?: string): Promise<CartWithDetails> {
    if (cartId) {
      const cart = await this.prisma.client.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } },
      });

      if (cart) {
        return cart as CartWithDetails;
      }
    }

    const newCart = await this.prisma.client.cart.create({
      data: { userId: userId || null },
      include: { items: { include: { product: true } } },
    });
    return newCart as CartWithDetails;
  }

  async addItemToCart(cartIdFromCookieOrUser: string | undefined, addToCartDto: AddToCartDto): Promise<CartWithDetails> { 
    const product = await this.productsService.findOne(addToCartDto.productId);

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException(`Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}.`);
    }

    let cart = await this.findOrCreateCart(cartIdFromCookieOrUser); 

    const existingCartItem = await this.prisma.client.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: addToCartDto.productId,
        },
      },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + addToCartDto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Estoque insuficiente para adicionar mais unidades do produto "${product.name}". Já no carrinho: ${existingCartItem.quantity}, Tentando adicionar: ${addToCartDto.quantity}, Disponível: ${product.stock}.`);
      }
      await this.prisma.client.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.client.cartItem.create({
        data: {
          cartId: cart.id,
          productId: addToCartDto.productId,
          quantity: addToCartDto.quantity,
          priceAtTime: product.price,
        },
      });
    }
    return this.getCart(cart.id);
  }

  async getCart(cartId: string): Promise<CartWithDetails> {
    const cart = await this.prisma.client.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Carrinho com ID "${cartId}" não encontrado.`);
    }
    return cart as CartWithDetails;
  }

  async updateCartItem(cartId: string, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<CartWithDetails> {
    const cartItem = await this.prisma.client.cartItem.findUnique({
      where: { id: itemId, cartId: cartId },
      include: { product: true }
    });

    if (!cartItem) {
      throw new NotFoundException(`Item com ID "${itemId}" não encontrado no carrinho "${cartId}".`);
    }

    if (cartItem.product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException(`Estoque insuficiente para o produto "${cartItem.product.name}". Disponível: ${cartItem.product.stock}.`);
    }

    if (updateCartItemDto.quantity <= 0) {
        await this.prisma.client.cartItem.delete({ where: { id: itemId }});
    } else {
        await this.prisma.client.cartItem.update({
          where: { id: itemId },
          data: { quantity: updateCartItemDto.quantity },
        });
    }
    return this.getCart(cartId);
  }

  async removeItemFromCart(cartId: string, itemId: string): Promise<CartWithDetails> {
    const cartItem = await this.prisma.client.cartItem.findUnique({
      where: { id: itemId, cartId: cartId },
    });

    if (!cartItem) {
      throw new NotFoundException(`Item com ID "${itemId}" não encontrado no carrinho "${cartId}" para remoção.`);
    }

    await this.prisma.client.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(cartId);
  }

  async clearCart(cartId: string): Promise<CartWithDetails> {
    await this.getCart(cartId); 

    await this.prisma.client.cartItem.deleteMany({
      where: { cartId: cartId },
    });
    return this.getCart(cartId); 
  }
}