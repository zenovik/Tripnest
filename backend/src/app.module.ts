import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';
import { CabsModule } from './cabs/cabs.module';
import { BookingsModule } from './bookings/bookings.module';
import { BannersModule } from './banners/banners.module';
import { AdminModule } from './admin/admin.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HotelsModule,
    CabsModule,
    BookingsModule,
    BannersModule,
    AdminModule,
    LocationsModule,
  ],
})
export class AppModule {}
