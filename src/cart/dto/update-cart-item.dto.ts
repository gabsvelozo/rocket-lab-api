import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, description: 'Nova quantidade do item no carrinho' })
  @IsNotEmpty({ message: 'A quantidade não pode estar vazia.' })
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade deve ser pelo menos 1. Para remover, use o endpoint de remoção.' })
  quantity: number;
}