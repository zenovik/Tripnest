import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { VehicleType } from '../../common/enums';
import { Type } from 'class-transformer';

export class FilterCabsDto {
  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  cabType?: VehicleType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasAc?: boolean;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minSeats?: number;
}

export class CreateCabDto {
  @ApiProperty({ example: 'Mercedes-Benz E-Class' })
  @IsString()
  @IsNotEmpty()
  vehicleName: string;

  @ApiProperty({ example: 'CAB-9901' })
  @IsString()
  @IsNotEmpty()
  vehicleNumber: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.LUXURY })
  @IsEnum(VehicleType)
  cabType: VehicleType;

  @ApiProperty({ example: 'John Doe Driver' })
  @IsString()
  @IsNotEmpty()
  driverName: string;

  @ApiProperty({ example: '+19876543219' })
  @IsString()
  @IsNotEmpty()
  driverPhone: string;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  baseFare: number;

  @ApiProperty({ example: 3.5 })
  @IsNumber()
  farePerKm: number;

  @ApiProperty({ example: 'city-uuid-here' })
  @IsString()
  @IsNotEmpty()
  cityId: string;
}
