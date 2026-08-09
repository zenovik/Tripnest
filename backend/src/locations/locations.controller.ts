import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('Locations & Google Maps')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('autocomplete')
  @ApiOperation({ summary: 'Get Google Places location autocomplete suggestions' })
  getAutocomplete(@Query('query') query: string) {
    return this.locationsService.getAutocomplete(query);
  }
}
