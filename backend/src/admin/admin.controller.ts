import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums';

@ApiTags('Admin Panel')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get total metrics, monthly revenue trends & recent bookings' })
  getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get list of registered users and roles' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/toggle-status')
  @ApiOperation({ summary: 'Activate or Deactivate User Account' })
  toggleUserStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.adminService.toggleUserStatus(id, isActive);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all system-wide hotel & cab bookings' })
  getAllBookings() {
    return this.adminService.getAllBookings();
  }

  @Patch('bookings/:type/:id/status')
  @ApiOperation({ summary: 'Update booking status (Pending, Confirmed, Cancelled, Completed)' })
  updateBookingStatus(@Param('type') type: 'hotel' | 'cab', @Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateBookingStatus(type, id, status);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get all states and cities' })
  getLocations() {
    return this.adminService.getLocations();
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payments transactions and promo coupons' })
  getPayments() {
    return this.adminService.getPayments();
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create new promo coupon' })
  createCoupon(@Body() dto: any) {
    return this.adminService.createCoupon(dto);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Delete promo coupon' })
  deleteCoupon(@Param('id') id: string) {
    return this.adminService.deleteCoupon(id);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get system audit and security logs' })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get enterprise website settings' })
  getSettings() {
    return this.adminService.getSettings();
  }
}
