import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateHotelBookingDto {
  @ApiProperty({ example: 'hotel-uuid-123' })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({ example: 'room-uuid-456' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ example: '2026-09-01' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ example: '2026-09-05' })
  @IsDateString()
  checkOutDate: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  guests: number;

  @ApiPropertyOptional({ example: 'WANDERLUST20' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'CARD', enum: ['CARD', 'UPI', 'NETBANKING', 'CASH'] })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class CreateCabBookingDto {
  @ApiProperty({ example: 'cab-uuid-789' })
  @IsString()
  @IsNotEmpty()
  cabId: string;

  @ApiProperty({ example: 'JFK Airport Terminal 4' })
  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @ApiProperty({ example: 'Times Square Grand Hotel' })
  @IsString()
  @IsNotEmpty()
  dropLocation: string;

  @ApiProperty({ example: '2026-09-01T10:30:00Z' })
  @IsDateString()
  pickupDateTime: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  passengers: number;

  @ApiProperty({ example: 18.5 })
  @IsNumber()
  distanceKm: number;

  @ApiPropertyOptional({ example: 'WANDERLUST20' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'UPI', enum: ['CARD', 'UPI', 'NETBANKING', 'CASH'] })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
