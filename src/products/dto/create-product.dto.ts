import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive() 
  price: number;

  @IsNumber()
  @Min(0) 
  stock: number;
}