import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateHotelBookingDto, CreateCabBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Bookings Pipeline')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('hotel')
  @ApiOperation({ summary: 'Book a hotel room with guest & payment details' })
  bookHotel(@Request() req: any, @Body() dto: CreateHotelBookingDto) {
    return this.bookingsService.createHotelBooking(req.user.id, dto);
  }

  @Post('cab')
  @ApiOperation({ summary: 'Book a cab with pickup, drop & passenger details' })
  bookCab(@Request() req: any, @Body() dto: CreateCabBookingDto) {
    return this.bookingsService.createCabBooking(req.user.id, dto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get all hotel & cab bookings for the logged-in user' })
  getMyBookings(@Request() req: any) {
    return this.bookingsService.getUserBookings(req.user.id);
  }
}
