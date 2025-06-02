import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class AddItemToCartDto {
  // @ApiProperty({ example: 'uuid-do-produto', description: 'ID do Produto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  // @ApiProperty({ example: 1, description: 'Quantidade a ser adicionada' })
  @IsInt()
  @Min(1)
  quantity: number;
}