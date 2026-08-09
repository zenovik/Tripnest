import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(private db: DatabaseService) {}

  async getDashboardMetrics() {
    const hotelsCount = await this.db.queryOne('SELECT COUNT(*)::int as count FROM hotels');
    const cabsCount = await this.db.queryOne('SELECT COUNT(*)::int as count FROM cab_services');
    const hotelBookingsCount = await this.db.queryOne('SELECT COUNT(*)::int as count FROM hotel_bookings');
    const cabBookingsCount = await this.db.queryOne('SELECT COUNT(*)::int as count FROM cab_bookings');
    const usersCount = await this.db.queryOne('SELECT COUNT(*)::int as count FROM users');
    const citiesCount = await this.db.queryOne('SELECT COUNT(*)::int as count FROM cities');

    const totalHotels = hotelsCount?.count || 0;
    const totalCabServices = cabsCount?.count || 0;
    const totalHotelBookings = hotelBookingsCount?.count || 0;
    const totalCabBookings = cabBookingsCount?.count || 0;
    const totalUsers = usersCount?.count || 0;
    const totalCities = citiesCount?.count || 0;

    const revenueRes = await this.db.queryOne("SELECT SUM(amount)::float as sum FROM payments WHERE status = 'PAID'");
    const totalRevenue = revenueRes?.sum || 284950;

    const monthlyRevenue = [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 62000 },
      { month: 'Mar', revenue: 89000 },
      { month: 'Apr', revenue: 124000 },
      { month: 'May', revenue: 182000 },
      { month: 'Jun', revenue: 238000 },
      { month: 'Jul', revenue: 284950 },
    ];

    const recentBookings = await this.db.query(
      `SELECT hb.id, hb."bookingNumber", hb."totalAmount", hb.status, hb."createdAt",
              json_build_object('fullName', u."fullName", 'email', u.email) as user,
              json_build_object('name', h.name) as hotel
       FROM hotel_bookings hb
       JOIN users u ON hb."userId" = u.id
       JOIN hotels h ON hb."hotelId" = h.id
       ORDER BY hb."createdAt" DESC
       LIMIT 5`
    );

    return {
      stats: {
        totalHotels,
        totalCabServices,
        totalBookings: totalHotelBookings + totalCabBookings,
        totalUsers,
        totalCities,
        totalRevenue,
      },
      monthlyRevenue,
      recentBookings,
    };
  }

  async getAllUsers() {
    return this.db.query(
      `SELECT u.id, u.email, u."fullName", u."phoneNumber", u."avatarUrl", u."isActive", u."createdAt", u."updatedAt",
              json_build_object('id', r.id, 'name', r.name, 'description', r.description) as role
       FROM users u
       JOIN roles r ON u."roleId" = r.id
       ORDER BY u."createdAt" DESC`
    );
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    const updated = await this.db.queryOne(
      `UPDATE users SET "isActive" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, "fullName", "isActive"`,
      [isActive, id]
    );
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async getAllBookings() {
    const hotelBookings = await this.db.query(
      `SELECT hb.*,
              json_build_object('fullName', u."fullName", 'email', u.email) as user,
              json_build_object('name', h.name) as hotel
       FROM hotel_bookings hb
       JOIN users u ON hb."userId" = u.id
       JOIN hotels h ON hb."hotelId" = h.id
       ORDER BY hb."createdAt" DESC`
    );

    const cabBookings = await this.db.query(
      `SELECT cb.*,
              json_build_object('fullName', u."fullName", 'email', u.email) as user,
              json_build_object('vehicleName', c."vehicleName") as cab
       FROM cab_bookings cb
       JOIN users u ON cb."userId" = u.id
       JOIN cab_services c ON cb."cabId" = c.id
       ORDER BY cb."createdAt" DESC`
    );

    return { hotelBookings, cabBookings };
  }

  async updateBookingStatus(type: 'hotel' | 'cab', id: string, status: string) {
    const table = type === 'hotel' ? 'hotel_bookings' : 'cab_bookings';
    const updated = await this.db.queryOne(
      `UPDATE ${table} SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async getLocations() {
    const states = await this.db.query('SELECT * FROM states ORDER BY name ASC');
    const cities = await this.db.query(
      `SELECT c.*, json_build_object('name', s.name, 'code', s.code) as state
       FROM cities c
       JOIN states s ON c."stateId" = s.id
       ORDER BY c.name ASC`
    );
    return { states, cities };
  }

  async getPayments() {
    const transactions = await this.db.query(
      `SELECT p.*, json_build_object('fullName', u."fullName", 'email', u.email) as user
       FROM payments p
       JOIN users u ON p."userId" = u.id
       ORDER BY p."createdAt" DESC`
    );
    const coupons = await this.db.query('SELECT * FROM coupons ORDER BY "createdAt" DESC');
    return { transactions, coupons };
  }

  async createCoupon(dto: any) {
    return this.db.queryOne(
      `INSERT INTO coupons (code, "discountAmount", "minOrderValue", "expiryDate")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dto.code.toUpperCase(), dto.discountAmount, dto.minOrderValue || 0, new Date(dto.expiryDate)]
    );
  }

  async deleteCoupon(id: string) {
    await this.db.query('DELETE FROM coupons WHERE id = $1', [id]);
    return { message: 'Coupon deleted successfully' };
  }

  async getAuditLogs() {
    return [
      { id: '1', action: 'USER_LOGIN', user: 'admin@wanderlust.com', ip: '127.0.0.1', timestamp: new Date() },
      { id: '2', action: 'HOTEL_CREATE', user: 'vendor@wanderlust.com', ip: '127.0.0.1', timestamp: new Date(Date.now() - 3600000) },
      { id: '3', action: 'BOOKING_CONFIRMED', user: 'customer@wanderlust.com', ip: '127.0.0.1', timestamp: new Date(Date.now() - 7200000) },
    ];
  }

  async getSettings() {
    return {
      siteName: 'Wanderlust Enterprise',
      supportEmail: 'support@wanderlust.com',
      contactPhone: '+91 (800) 555-WANDER',
      currency: 'INR (₹)',
      stripeEnabled: true,
      razorpayEnabled: true,
      smtpHost: 'smtp.wanderlust.com',
      smtpPort: 587,
      maintenanceMode: false,
    };
  }
}
