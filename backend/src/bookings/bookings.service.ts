import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateHotelBookingDto, CreateCabBookingDto } from './dto/booking.dto';
import { BookingStatus, PaymentStatus } from '../common/enums';

@Injectable()
export class BookingsService {
  constructor(private db: DatabaseService) {}

  async createHotelBooking(userId: string, dto: CreateHotelBookingDto) {
    let roomId = dto.roomId;
    if (!roomId) {
      const roomFirst = await this.db.queryOne('SELECT id FROM rooms WHERE "hotelId" = $1 LIMIT 1', [dto.hotelId]);
      if (roomFirst) {
        roomId = roomFirst.id;
      } else {
        // Fallback room
        const anyRoom = await this.db.queryOne('SELECT id FROM rooms LIMIT 1');
        roomId = anyRoom ? anyRoom.id : 'default-room-id';
      }
    }

    const room = await this.db.queryOne(
      `SELECT r.*, json_build_object('id', h.id, 'name', h.name, 'discountPercent', h."discountPercent") as hotel
       FROM rooms r
       JOIN hotels h ON r."hotelId" = h.id
       WHERE r.id = $1`,
      [roomId]
    );

    const checkIn = new Date(dto.checkInDate || Date.now());
    const checkOut = new Date(dto.checkOutDate || (Date.now() + 86400000 * 3));
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));

    let grossAmount = (room ? room.pricePerNight : 3500) * nights;

    if (room && room.hotel && room.hotel.discountPercent > 0) {
      grossAmount = grossAmount * (1 - room.hotel.discountPercent / 100);
    }

    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.db.queryOne('SELECT * FROM coupons WHERE code = $1', [dto.couponCode.toUpperCase()]);
      if (coupon && coupon.isActive && grossAmount >= coupon.minOrderValue) {
        discount = coupon.discountAmount;
      }
    }

    const totalAmount = Math.max(0, parseFloat((grossAmount - discount).toFixed(2)));
    const bookingNumber = `WL-HTL-${Math.floor(100000 + Math.random() * 900000)}`;

    const booking = await this.db.queryOne(
      `INSERT INTO hotel_bookings ("bookingNumber", "userId", "hotelId", "roomId", "checkInDate", "checkOutDate", guests, "totalAmount", status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        bookingNumber,
        userId,
        dto.hotelId,
        roomId,
        checkIn,
        checkOut,
        dto.guests || 1,
        totalAmount,
        BookingStatus.CONFIRMED,
      ]
    );

    const paymentTransactionId = `TXN-HTL-${Date.now()}`;
    const payment = await this.db.queryOne(
      `INSERT INTO payments ("transactionId", "userId", amount, "paymentMethod", status, "hotelBookingId")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        paymentTransactionId,
        userId,
        totalAmount,
        dto.paymentMethod || 'CARD',
        PaymentStatus.PAID,
        booking.id,
      ]
    );

    const hotelDetails = await this.db.queryOne('SELECT * FROM hotels WHERE id = $1', [dto.hotelId]);

    booking.hotel = hotelDetails;
    booking.room = room;
    booking.payment = payment;

    return {
      message: 'Hotel booking confirmed successfully!',
      booking,
    };
  }

  async createCabBooking(userId: string, dto: CreateCabBookingDto) {
    let cab = await this.db.queryOne('SELECT * FROM cab_services WHERE id = $1', [dto.cabId]);
    if (!cab) {
      cab = await this.db.queryOne('SELECT * FROM cab_services LIMIT 1');
    }

    const baseFare = cab ? cab.baseFare : 250;
    const farePerKm = cab ? cab.farePerKm : 18;
    const distanceKm = dto.distanceKm || 15;

    let grossAmount = baseFare + distanceKm * farePerKm;

    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.db.queryOne('SELECT * FROM coupons WHERE code = $1', [dto.couponCode.toUpperCase()]);
      if (coupon && coupon.isActive && grossAmount >= coupon.minOrderValue) {
        discount = coupon.discountAmount;
      }
    }

    const totalAmount = Math.max(0, parseFloat((grossAmount - discount).toFixed(2)));
    const bookingNumber = `WL-CAB-${Math.floor(100000 + Math.random() * 900000)}`;

    const cabIdToUse = cab ? cab.id : dto.cabId;

    const booking = await this.db.queryOne(
      `INSERT INTO cab_bookings ("bookingNumber", "userId", "cabId", "pickupLocation", "dropLocation", "pickupDateTime", passengers, "distanceKm", "totalAmount", status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        bookingNumber,
        userId,
        cabIdToUse,
        dto.pickupLocation || 'Indira Gandhi International Airport (DEL)',
        dto.dropLocation || 'City Center Hotel',
        new Date(dto.pickupDateTime || Date.now()),
        dto.passengers || 1,
        distanceKm,
        totalAmount,
        BookingStatus.CONFIRMED,
      ]
    );

    const paymentTransactionId = `TXN-CAB-${Date.now()}`;
    const payment = await this.db.queryOne(
      `INSERT INTO payments ("transactionId", "userId", amount, "paymentMethod", status, "cabBookingId")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        paymentTransactionId,
        userId,
        totalAmount,
        dto.paymentMethod || 'UPI',
        PaymentStatus.PAID,
        booking.id,
      ]
    );

    booking.cab = cab;
    booking.payment = payment;

    return {
      message: 'Cab booking confirmed successfully!',
      booking,
    };
  }

  async getUserBookings(userId: string) {
    const hotelBookings = await this.db.query(
      `SELECT hb.*,
              json_build_object('id', h.id, 'name', h.name, 'address', h.address) as hotel,
              json_build_object('id', r.id, 'roomType', r."roomType") as room,
              json_build_object('id', p.id, 'transactionId', p."transactionId", 'amount', p.amount, 'status', p.status) as payment
       FROM hotel_bookings hb
       LEFT JOIN hotels h ON hb."hotelId" = h.id
       LEFT JOIN rooms r ON hb."roomId" = r.id
       LEFT JOIN payments p ON p."hotelBookingId" = hb.id
       WHERE hb."userId" = $1
       ORDER BY hb."createdAt" DESC`,
      [userId]
    );

    const cabBookings = await this.db.query(
      `SELECT cb.*,
              json_build_object('id', c.id, 'vehicleName', c."vehicleName", 'vehicleNumber', c."vehicleNumber") as cab,
              json_build_object('id', p.id, 'transactionId', p."transactionId", 'amount', p.amount, 'status', p.status) as payment
       FROM cab_bookings cb
       LEFT JOIN cab_services c ON cb."cabId" = c.id
       LEFT JOIN payments p ON p."cabBookingId" = cb.id
       WHERE cb."userId" = $1
       ORDER BY cb."createdAt" DESC`,
      [userId]
    );

    return {
      hotelBookings,
      cabBookings,
    };
  }
}
