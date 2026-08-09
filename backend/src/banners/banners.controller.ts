import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BannersService } from './banners.service';

@ApiTags('Banners & Hero Section')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get active hero background slider banners' })
  getBanners() {
    return this.bannersService.getActiveBanners();
  }
}
