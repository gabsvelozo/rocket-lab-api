import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

@Injectable()
export class CartService {
  private currentCartItems: CartItem[] = []; 

  constructor(private readonly productsService: ProductsService) {}

  private calculateTotal(): number {
    return this.currentCartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  }

  async addItem(productId: string, quantityToAdd: number): Promise<Cart> {
    if (quantityToAdd <= 0) {
        throw new BadRequestException('A quantidade a ser adicionada deve ser positiva.');
    }
    const product = await this.productsService.findOne(productId);

    const existingItemIndex = this.currentCartItems.findIndex(
      (item) => item.product.id === productId,
    );

    if (existingItemIndex > -1) {
      const newQuantity = this.currentCartItems[existingItemIndex].quantity + quantityToAdd;
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Estoque insuficiente para ${product.name}. Em estoque: ${product.stock}, Solicitado no total: ${newQuantity}`,
        );
      }
      this.currentCartItems[existingItemIndex].quantity = newQuantity;
    } else {
      if (product.stock < quantityToAdd) {
        throw new BadRequestException(
          `Estoque insuficiente para ${product.name}. Em estoque: ${product.stock}, Solicitado: ${quantityToAdd}`,
        );
      }
      this.currentCartItems.push({ product, quantity: quantityToAdd });
    }
    return this.getCart();
  }

  async removeItem(productId: string): Promise<Cart> {
    const itemIndex = this.currentCartItems.findIndex(
      (item) => item.product.id === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(`Produto com ID "${productId}" não encontrado no carrinho.`);
    }

    this.currentCartItems.splice(itemIndex, 1);
    return this.getCart();
  }

  async updateItemQuantity(productId: string, newQuantity: number): Promise<Cart> {
    if (newQuantity < 0) {
        throw new BadRequestException('A quantidade não pode ser negativa.');
    }
    
    const itemIndex = this.currentCartItems.findIndex(
      (item) => item.product.id === productId,
    );

    if (itemIndex === -1) {
      if (newQuantity > 0) {
          throw new NotFoundException(`Produto com ID "${productId}" não encontrado no carrinho para atualização.`);
      }
      return this.getCart(); 
    }

    if (newQuantity === 0) {
      this.currentCartItems.splice(itemIndex, 1); 
      return this.getCart();
    }

    const product = this.currentCartItems[itemIndex].product; 

    if (product.stock < newQuantity) {
      throw new BadRequestException(
        `Estoque insuficiente para ${product.name}. Em estoque: ${product.stock}, Nova quantidade solicitada: ${newQuantity}`,
      );
    }

    this.currentCartItems[itemIndex].quantity = newQuantity;
    return this.getCart();
  }

  getCart(): Cart {
    return {
      items: [...this.currentCartItems], 
      total: this.calculateTotal(),
    };
  }

  clearCart(): Cart {
    this.currentCartItems = [];
    return this.getCart();
  }

  getItemsForOrder(): CartItem[] {
    return [...this.currentCartItems]; 
  }
}