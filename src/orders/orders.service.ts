import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { Order, OrderItem, Product, Prisma } from '@prisma/client';

type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: Product;
  })[];
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {}

  async createOrderFromCart(cartId: string, userId?: string): Promise<OrderWithDetails> {
    const cart = await this.cartService.getCart(cartId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('O carrinho está vazio ou não foi encontrado.');
    }

    return this.prisma.client.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const cartItem of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: cartItem.productId },
        });

        if (!product) {
          throw new NotFoundException(`Produto com ID "${cartItem.productId}" não encontrado durante a criação do pedido.`);
        }
        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(`Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}, Pedido: ${cartItem.quantity}.`);
        }

        totalAmount += cartItem.priceAtTime * cartItem.quantity;

        orderItemsData.push({
          quantity: cartItem.quantity,
          priceAtTime: cartItem.priceAtTime,
          product: {
            connect: {
              id: cartItem.productId,
            },
          },
        });
      }

      const order = await tx.order.create({
        data: {
          userId: userId || null,
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      for (const cartItem of cart.items) {
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stock: {
              decrement: cartItem.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cartId },
      });

      return order;
    }).catch(error => {
        console.error("Falha na transação de criação de pedido:", error);
        if(error instanceof NotFoundException || error instanceof BadRequestException) {
            throw error;
        }
        throw new InternalServerErrorException("Ocorreu um erro ao processar seu pedido.");
    });
  }

  async findAll(userId?: string): Promise<OrderWithDetails[]> {
    return this.prisma.client.order.findMany({
      where: userId ? { userId } : {},
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId?: string): Promise<OrderWithDetails> {
    const order = await this.prisma.client.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado.`);
    }
    if (userId && order.userId !== userId) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado para este usuário.`);
    }
    return order;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    await this.findOne(orderId); 

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELED', 'REFUNDED'];
    if (!validStatuses.includes(status.toUpperCase())) {
        throw new BadRequestException(`Status "${status}" inválido.`);
    }

    return this.prisma.client.order.update({
      where: { id: orderId },
      data: { status: status.toUpperCase() },
    });
  }
}