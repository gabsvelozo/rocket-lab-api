import { IsInt, Min } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger'; // Opcional para documentação

export class UpdateCartItemQuantityDto {
  // @ApiProperty({ example: 2, description: 'Nova quantidade para o item' })
  @IsInt()
  @Min(0) // Permitir 0 para remover o item através da atualização
  quantity: number;
}