import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FilterCabsDto, CreateCabDto } from './dto/cab.dto';

@Injectable()
export class CabsService {
  constructor(private db: DatabaseService) {}

  async findAll(filter: FilterCabsDto) {
    const params: any[] = [];
    const whereConditions: string[] = ['cs."isAvailable" = true'];

    if (filter.city) {
      params.push(`%${filter.city}%`);
      whereConditions.push(`c.name ILIKE $${params.length}`);
    }

    if (filter.cabType) {
      params.push(filter.cabType);
      whereConditions.push(`cs."cabType" = $${params.length}`);
    }

    if (filter.hasAc !== undefined) {
      params.push(filter.hasAc);
      whereConditions.push(`cs."hasAc" = $${params.length}`);
    }

    if (filter.minSeats !== undefined) {
      params.push(filter.minSeats);
      whereConditions.push(`cs."seatCapacity" >= $${params.length}`);
    }

    const whereSql = `WHERE ${whereConditions.join(' AND ')}`;

    const sql = `
      SELECT 
        cs.id, cs."vehicleName", cs."vehicleNumber", cs."cabType", cs."driverName", cs."driverPhone",
        cs."driverRating", cs."hasAc", cs."seatCapacity", cs."baseFare", cs."farePerKm", cs."cityId",
        cs."vendorId", cs."isAvailable", cs."createdAt", cs."updatedAt",
        json_build_object('id', c.id, 'name', c.name, 'imageUrl', c."imageUrl", 'isPopular', c."isPopular") as city,
        COALESCE((
          SELECT json_agg(json_build_object('id', img.id, 'url', img.url))
          FROM cab_images img WHERE img."cabId" = cs.id
        ), '[]'::json) as images,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', rev.id, 'rating', rev.rating, 'comment', rev.comment, 'createdAt', rev."createdAt",
            'user', json_build_object('fullName', u."fullName")
          ))
          FROM (
            SELECT r.* FROM reviews r WHERE r."cabId" = cs.id ORDER BY r."createdAt" DESC LIMIT 5
          ) rev JOIN users u ON rev."userId" = u.id
        ), '[]'::json) as reviews
      FROM cab_services cs
      JOIN cities c ON cs."cityId" = c.id
      ${whereSql}
      ORDER BY cs."createdAt" DESC
    `;

    const cabs = await this.db.query(sql, params);

    return {
      count: cabs.length,
      data: cabs,
    };
  }

  async findOne(id: string) {
    const sql = `
      SELECT 
        cs.id, cs."vehicleName", cs."vehicleNumber", cs."cabType", cs."driverName", cs."driverPhone",
        cs."driverRating", cs."hasAc", cs."seatCapacity", cs."baseFare", cs."farePerKm", cs."cityId",
        cs."vendorId", cs."isAvailable", cs."createdAt", cs."updatedAt",
        json_build_object('id', c.id, 'name', c.name, 'imageUrl', c."imageUrl", 'isPopular', c."isPopular") as city,
        COALESCE((
          SELECT json_agg(json_build_object('id', img.id, 'url', img.url))
          FROM cab_images img WHERE img."cabId" = cs.id
        ), '[]'::json) as images,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', rev.id, 'rating', rev.rating, 'comment', rev.comment, 'createdAt', rev."createdAt",
            'user', json_build_object('fullName', u."fullName", 'avatarUrl', u."avatarUrl")
          ))
          FROM reviews rev JOIN users u ON rev."userId" = u.id WHERE rev."cabId" = cs.id
        ), '[]'::json) as reviews,
        (
          SELECT json_build_object('id', v.id, 'fullName', v."fullName", 'email', v.email)
          FROM users v WHERE v.id = cs."vendorId"
        ) as vendor
      FROM cab_services cs
      JOIN cities c ON cs."cityId" = c.id
      WHERE cs.id = $1
    `;

    const cab = await this.db.queryOne(sql, [id]);

    if (!cab) {
      throw new NotFoundException(`Cab service with ID ${id} not found`);
    }

    return cab;
  }

  async calculateFare(cabId: string, distanceKm: number) {
    const cab = await this.findOne(cabId);
    const estimatedFare = cab.baseFare + distanceKm * cab.farePerKm;
    return {
      cabId: cab.id,
      vehicleName: cab.vehicleName,
      distanceKm,
      baseFare: cab.baseFare,
      farePerKm: cab.farePerKm,
      estimatedFare: parseFloat(estimatedFare.toFixed(2)),
    };
  }

  async create(dto: CreateCabDto & { imageUrl?: string; imageUrls?: string[] }, vendorId?: string) {
    const cab = await this.db.queryOne(
      `INSERT INTO cab_services ("vehicleName", "vehicleNumber", "cabType", "driverName", "driverPhone", "baseFare", "farePerKm", "cityId", "vendorId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        dto.vehicleName,
        dto.vehicleNumber,
        dto.cabType,
        dto.driverName,
        dto.driverPhone,
        dto.baseFare,
        dto.farePerKm,
        dto.cityId,
        vendorId || null,
      ]
    );

    const imageUrls = dto.imageUrls || (dto.imageUrl ? [dto.imageUrl] : ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80']);
    for (const url of imageUrls) {
      await this.db.query(`INSERT INTO cab_images (url, "cabId") VALUES ($1, $2)`, [url, cab.id]);
    }

    return this.findOne(cab.id);
  }
}
