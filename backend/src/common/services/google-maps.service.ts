import { Injectable, Logger } from '@nestjs/common';

export interface LocationSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  city?: string;
  lat?: number;
  lng?: number;
}

@Injectable()
export class GoogleMapsService {
  private logger = new Logger('GoogleMapsService');

  // Popular Indian cities and airports preset suggestions
  private presetLocations: LocationSuggestion[] = [
    { placeId: 'p1', description: 'New Delhi, Delhi, India', mainText: 'New Delhi', secondaryText: 'Delhi, India', city: 'New Delhi', lat: 28.6139, lng: 77.2090 },
    { placeId: 'p2', description: 'Indira Gandhi International Airport (DEL), New Delhi', mainText: 'DEL Airport', secondaryText: 'New Delhi, India', city: 'New Delhi', lat: 28.5562, lng: 77.1000 },
    { placeId: 'p3', description: 'Mumbai, Maharashtra, India', mainText: 'Mumbai', secondaryText: 'Maharashtra, India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { placeId: 'p4', description: 'Chhatrapati Shivaji Maharaj International Airport (BOM), Mumbai', mainText: 'BOM Airport', secondaryText: 'Mumbai, India', city: 'Mumbai', lat: 19.0896, lng: 72.8656 },
    { placeId: 'p5', description: 'Bengaluru, Karnataka, India', mainText: 'Bengaluru', secondaryText: 'Karnataka, India', city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { placeId: 'p6', description: 'Kempegowda International Airport (BLR), Bengaluru', mainText: 'BLR Airport', secondaryText: 'Bengaluru, India', city: 'Bengaluru', lat: 13.1986, lng: 77.7066 },
    { placeId: 'p7', description: 'Goa Beach Resort Area, Goa, India', mainText: 'Goa', secondaryText: 'India', city: 'Goa', lat: 15.2993, lng: 74.1240 },
    { placeId: 'p8', description: 'Jaipur, Rajasthan, India', mainText: 'Jaipur', secondaryText: 'Rajasthan, India', city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  ];

  autocomplete(query: string): LocationSuggestion[] {
    if (!query || query.trim().length === 0) {
      return this.presetLocations.slice(0, 5);
    }
    const q = query.toLowerCase();
    const matches = this.presetLocations.filter(loc =>
      loc.description.toLowerCase().includes(q) ||
      loc.mainText.toLowerCase().includes(q) ||
      loc.secondaryText.toLowerCase().includes(q)
    );
    if (matches.length > 0) return matches;

    return [
      {
        placeId: `custom_${Date.now()}`,
        description: `${query}, India`,
        mainText: query,
        secondaryText: 'India',
        city: query,
        lat: 28.6139,
        lng: 77.2090
      }
    ];
  }
}
