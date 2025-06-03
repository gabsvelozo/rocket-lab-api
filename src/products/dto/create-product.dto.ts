import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsPositive, IsInt, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop Gamer X', description: 'Nome do produto' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  name: string;

  @ApiProperty({ example: 'Laptop de alta performance para jogos.', description: 'Descrição do produto', required: false })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string.' })
  description?: string;

  @ApiProperty({ example: 7999.99, description: 'Preço do produto' })
  @IsNotEmpty({ message: 'O preço não pode estar vazio.' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número com no máximo 2 casas decimais.' })
  @IsPositive({ message: 'O preço deve ser um número positivo.' })
  price: number;

  @ApiProperty({ example: 50, description: 'Quantidade em estoque do produto' })
  @IsNotEmpty({ message: 'O estoque não pode estar vazio.' })
  @IsInt({ message: 'O estoque deve ser um número inteiro.' })
  @Min(0, { message: 'O estoque não pode ser negativo.'})
  stock: number;
}