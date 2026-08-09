import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BannersService {
  constructor(private db: DatabaseService) {}

  async getActiveBanners() {
    return this.db.query('SELECT * FROM banners WHERE "isActive" = true ORDER BY "sortOrder" ASC');
  }
}
