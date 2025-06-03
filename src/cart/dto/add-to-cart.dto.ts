import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', description: 'ID do produto (UUID)' })
  @IsNotEmpty({ message: 'O ID do produto não pode estar vazio.' })
  @IsUUID('4', { message: 'O ID do produto deve ser um UUID válido.'})
  productId: string;

  @ApiProperty({ example: 1, description: 'Quantidade do produto a ser adicionada' })
  @IsNotEmpty({ message: 'A quantidade não pode estar vazia.' })
  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @Min(1, { message: 'A quantidade deve ser pelo menos 1.' })
  quantity: number;
}