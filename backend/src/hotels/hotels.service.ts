import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FilterHotelsDto, CreateHotelDto } from './dto/hotel.dto';

@Injectable()
export class HotelsService {
  constructor(private db: DatabaseService) {}

  async findAll(filter: FilterHotelsDto) {
    const params: any[] = [];
    const whereConditions: string[] = [];

    if (filter.city) {
      params.push(`%${filter.city}%`);
      whereConditions.push(`c.name ILIKE $${params.length}`);
    }

    if (filter.search) {
      params.push(`%${filter.search}%`);
      const idx = params.length;
      whereConditions.push(`(h.name ILIKE $${idx} OR h.description ILIKE $${idx} OR h.address ILIKE $${idx})`);
    }

    if (filter.minPrice !== undefined) {
      params.push(filter.minPrice);
      whereConditions.push(`h."pricePerNight" >= $${params.length}`);
    }

    if (filter.maxPrice !== undefined) {
      params.push(filter.maxPrice);
      whereConditions.push(`h."pricePerNight" <= $${params.length}`);
    }

    if (filter.minRating !== undefined) {
      params.push(filter.minRating);
      whereConditions.push(`h."starRating" >= $${params.length}`);
    }

    const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let orderBySql = 'ORDER BY h."createdAt" DESC';
    if (filter.sortBy === 'price_asc') orderBySql = 'ORDER BY h."pricePerNight" ASC';
    if (filter.sortBy === 'price_desc') orderBySql = 'ORDER BY h."pricePerNight" DESC';
    if (filter.sortBy === 'rating_desc') orderBySql = 'ORDER BY h."starRating" DESC';

    const sql = `
      SELECT 
        h.id, h.name, h.description, h.address, h."cityId", h."starRating", h."pricePerNight",
        h."discountPercent", h."vendorId", h."isFeatured", h.latitude, h.longitude, h."createdAt", h."updatedAt",
        json_build_object('id', c.id, 'name', c.name, 'imageUrl', c."imageUrl", 'isPopular', c."isPopular") as city,
        COALESCE((
          SELECT json_agg(json_build_object('id', img.id, 'url', img.url, 'isPrimary', img."isPrimary"))
          FROM hotel_images img WHERE img."hotelId" = h.id
        ), '[]'::json) as images,
        COALESCE((
          SELECT json_agg(json_build_object('id', rm.id, 'roomType', rm."roomType", 'capacity', rm.capacity, 'pricePerNight', rm."pricePerNight", 'availableCount', rm."availableCount", 'features', rm.features))
          FROM rooms rm WHERE rm."hotelId" = h.id
        ), '[]'::json) as rooms,
        COALESCE((
          SELECT json_agg(json_build_object('id', a.id, 'name', a.name, 'icon', a.icon))
          FROM "_AmenityToHotel" ah JOIN amenities a ON ah."A" = a.id WHERE ah."B" = h.id
        ), '[]'::json) as amenities,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', rev.id, 'rating', rev.rating, 'comment', rev.comment, 'createdAt', rev."createdAt",
            'user', json_build_object('fullName', u."fullName", 'avatarUrl', u."avatarUrl")
          ))
          FROM (
            SELECT r.* FROM reviews r WHERE r."hotelId" = h.id ORDER BY r."createdAt" DESC LIMIT 5
          ) rev JOIN users u ON rev."userId" = u.id
        ), '[]'::json) as reviews
      FROM hotels h
      JOIN cities c ON h."cityId" = c.id
      ${whereSql}
      ${orderBySql}
    `;

    const hotels = await this.db.query(sql, params);

    return {
      count: hotels.length,
      data: hotels,
    };
  }

  async findOne(id: string) {
    const sql = `
      SELECT 
        h.id, h.name, h.description, h.address, h."cityId", h."starRating", h."pricePerNight",
        h."discountPercent", h."vendorId", h."isFeatured", h.latitude, h.longitude, h."createdAt", h."updatedAt",
        json_build_object('id', c.id, 'name', c.name, 'imageUrl', c."imageUrl", 'isPopular', c."isPopular") as city,
        COALESCE((
          SELECT json_agg(json_build_object('id', img.id, 'url', img.url, 'isPrimary', img."isPrimary"))
          FROM hotel_images img WHERE img."hotelId" = h.id
        ), '[]'::json) as images,
        COALESCE((
          SELECT json_agg(json_build_object('id', rm.id, 'roomType', rm."roomType", 'capacity', rm.capacity, 'pricePerNight', rm."pricePerNight", 'availableCount', rm."availableCount", 'features', rm.features))
          FROM rooms rm WHERE rm."hotelId" = h.id
        ), '[]'::json) as rooms,
        COALESCE((
          SELECT json_agg(json_build_object('id', a.id, 'name', a.name, 'icon', a.icon))
          FROM "_AmenityToHotel" ah JOIN amenities a ON ah."A" = a.id WHERE ah."B" = h.id
        ), '[]'::json) as amenities,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', rev.id, 'rating', rev.rating, 'comment', rev.comment, 'createdAt', rev."createdAt",
            'user', json_build_object('fullName', u."fullName", 'avatarUrl', u."avatarUrl")
          ))
          FROM reviews rev JOIN users u ON rev."userId" = u.id WHERE rev."hotelId" = h.id
        ), '[]'::json) as reviews,
        (
          SELECT json_build_object('id', v.id, 'fullName', v."fullName", 'email', v.email)
          FROM users v WHERE v.id = h."vendorId"
        ) as vendor
      FROM hotels h
      JOIN cities c ON h."cityId" = c.id
      WHERE h.id = $1
    `;

    const hotel = await this.db.queryOne(sql, [id]);

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async create(dto: CreateHotelDto, vendorId?: string) {
    const hotel = await this.db.queryOne(
      `INSERT INTO hotels (name, description, address, "cityId", "pricePerNight", "discountPercent", "starRating", "vendorId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        dto.name,
        dto.description,
        dto.address,
        dto.cityId,
        dto.pricePerNight,
        dto.discountPercent || 0,
        dto.starRating || 4.0,
        vendorId || null,
      ]
    );

    if (dto.imageUrls && dto.imageUrls.length > 0) {
      for (let i = 0; i < dto.imageUrls.length; i++) {
        await this.db.query(
          `INSERT INTO hotel_images (url, "isPrimary", "hotelId") VALUES ($1, $2, $3)`,
          [dto.imageUrls[i], i === 0, hotel.id]
        );
      }
    }

    return this.findOne(hotel.id);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.db.query('DELETE FROM hotels WHERE id = $1', [id]);
    return { message: 'Hotel deleted successfully' };
  }
}
