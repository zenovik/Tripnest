import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CabsService } from './cabs.service';
import { FilterCabsDto, CreateCabDto } from './dto/cab.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums';

@ApiTags('Cab Booking')
@Controller('cabs')
export class CabsController {
  constructor(private readonly cabsService: CabsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of available cabs with filters (City, Type, AC, Seats)' })
  findAll(@Query() filter: FilterCabsDto) {
    return this.cabsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single cab details & driver information' })
  findOne(@Param('id') id: string) {
    return this.cabsService.findOne(id);
  }

  @Get(':id/calculate-fare')
  @ApiOperation({ summary: 'Calculate estimated fare based on distance in KM' })
  calculateFare(@Param('id') id: string, @Query('distanceKm') distanceKm: number) {
    return this.cabsService.calculateFare(id, Number(distanceKm) || 10);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new cab listing (Admin / Vendor only)' })
  create(@Body() dto: CreateCabDto, @Request() req: any) {
    return this.cabsService.create(dto, req.user.id);
  }
}
