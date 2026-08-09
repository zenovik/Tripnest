import { Module } from '@nestjs/common';
import { CabsService } from './cabs.service';
import { CabsController } from './cabs.controller';

@Module({
  controllers: [CabsController],
  providers: [CabsService],
  exports: [CabsService],
})
export class CabsModule {}
