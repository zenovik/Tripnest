import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: '+19876543210' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'CUSTOMER', enum: ['CUSTOMER', 'VENDOR', 'ADMIN'] })
  @IsOptional()
  @IsString()
  roleName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@wanderlust.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  password: string;
}

export class SendOtpDto {
  @ApiProperty({ example: '+19876543210' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+19876543210' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otpCode: string;
}
