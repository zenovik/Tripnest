import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class LocationsService {
  constructor(private db: DatabaseService) {}

  async getAutocomplete(query: string) {
    const presets = [
      { placeId: 'p1', description: 'New Delhi, Delhi, India', mainText: 'New Delhi', secondaryText: 'Delhi, India', city: 'New Delhi' },
      { placeId: 'p2', description: 'Indira Gandhi International Airport (DEL), New Delhi', mainText: 'DEL Airport', secondaryText: 'New Delhi, India', city: 'New Delhi' },
      { placeId: 'p3', description: 'Mumbai, Maharashtra, India', mainText: 'Mumbai', secondaryText: 'Maharashtra, India', city: 'Mumbai' },
      { placeId: 'p4', description: 'Chhatrapati Shivaji International Airport (BOM), Mumbai', mainText: 'BOM Airport', secondaryText: 'Mumbai, India', city: 'Mumbai' },
      { placeId: 'p5', description: 'Bengaluru, Karnataka, India', mainText: 'Bengaluru', secondaryText: 'Karnataka, India', city: 'Bengaluru' },
      { placeId: 'p6', description: 'Goa Beach Resort Area, Goa, India', mainText: 'Goa', secondaryText: 'India', city: 'Goa' },
    ];

    if (!query || query.trim().length === 0) {
      return presets;
    }

    const q = query.toLowerCase();
    const filtered = presets.filter(p => p.description.toLowerCase().includes(q) || p.mainText.toLowerCase().includes(q));
    if (filtered.length > 0) return filtered;

    return [
      { placeId: `loc_${Date.now()}`, description: `${query}, India`, mainText: query, secondaryText: 'India', city: query }
    ];
  }
}
