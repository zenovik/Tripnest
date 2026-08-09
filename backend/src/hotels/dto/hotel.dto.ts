import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterHotelsDto {
  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ example: 4.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @ApiPropertyOptional({ example: 'Grand' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'price_asc', enum: ['price_asc', 'price_desc', 'rating_desc'] })
  @IsOptional()
  @IsString()
  sortBy?: string;
}

export class CreateHotelDto {
  @ApiProperty({ example: 'Grand Horizon Resort' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Luxury 5-star hotel with beachfront views' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '100 Beach Boulevard' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'city-uuid-here' })
  @IsString()
  @IsNotEmpty()
  cityId: string;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  pricePerNight: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ example: 4.8 })
  @IsOptional()
  @IsNumber()
  starRating?: number;

  @ApiPropertyOptional({ example: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'] })
  @IsOptional()
  @IsArray()
  imageUrls?: string[];
}
