import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://saud@localhost:5432/travel_db';
    this.pool = new Pool({
      connectionString,
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      this.logger.log('Successfully connected to local PostgreSQL 16 database server.');
      client.release();
    } catch (err) {
      this.logger.error('Failed to connect to local PostgreSQL database server:', err);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
    const res = await this.pool.query<T>(text, params);
    return res.rows;
  }

  async queryOne<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] || null;
  }

  getPool(): Pool {
    return this.pool;
  }
}
