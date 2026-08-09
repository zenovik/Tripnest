import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { FilterHotelsDto, CreateHotelDto } from './dto/hotel.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all hotels with filtering, search & sorting' })
  findAll(@Query() filter: FilterHotelsDto) {
    return this.hotelsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed information for a single hotel' })
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new hotel (Admin / Vendor only)' })
  create(@Body() dto: CreateHotelDto, @Request() req: any) {
    return this.hotelsService.create(dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a hotel (Admin only)' })
  delete(@Param('id') id: string) {
    return this.hotelsService.delete(id);
  }
}
