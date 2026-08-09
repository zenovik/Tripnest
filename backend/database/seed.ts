import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://saud@localhost:5432/travel_db',
});

async function main() {
  console.log('🌱 Starting Database Seeding on Local PostgreSQL 16 (INR ₹)...');

  // 1. Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Super Administrator with full access' },
    { name: 'ADMIN', description: 'Platform Administrator' },
    { name: 'VENDOR', description: 'Hotel & Cab Service Vendor' },
    { name: 'CUSTOMER', description: 'Regular Customer' },
  ];

  for (const role of roles) {
    await pool.query(
      `INSERT INTO roles (name, description, "updatedAt") 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, "updatedAt" = NOW()`,
      [role.name, role.description]
    );
  }

  const adminRoleRes = await pool.query(`SELECT id FROM roles WHERE name = 'ADMIN'`);
  const customerRoleRes = await pool.query(`SELECT id FROM roles WHERE name = 'CUSTOMER'`);
  const vendorRoleRes = await pool.query(`SELECT id FROM roles WHERE name = 'VENDOR'`);

  const adminRoleId = adminRoleRes.rows[0].id;
  const customerRoleId = customerRoleRes.rows[0].id;
  const vendorRoleId = vendorRoleRes.rows[0].id;

  // 2. Users
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const adminUserRes = await pool.query(
    `INSERT INTO users (email, password, "fullName", "phoneNumber", "avatarUrl", "roleId", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (email) DO UPDATE SET "fullName" = EXCLUDED."fullName", "updatedAt" = NOW()
     RETURNING id`,
    ['admin@wanderlust.com', hashedPassword, 'Alex Vance (Admin)', '+91 98765 43210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', adminRoleId]
  );
  const adminUserId = adminUserRes.rows[0].id;

  const customerUserRes = await pool.query(
    `INSERT INTO users (email, password, "fullName", "phoneNumber", "avatarUrl", "roleId", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (email) DO UPDATE SET "fullName" = EXCLUDED."fullName", "updatedAt" = NOW()
     RETURNING id`,
    ['customer@wanderlust.com', hashedPassword, 'Sophia Martinez', '+91 98765 43211', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', customerRoleId]
  );
  const customerUserId = customerUserRes.rows[0].id;

  const vendorUserRes = await pool.query(
    `INSERT INTO users (email, password, "fullName", "phoneNumber", "avatarUrl", "roleId", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (email) DO UPDATE SET "fullName" = EXCLUDED."fullName", "updatedAt" = NOW()
     RETURNING id`,
    ['vendor@wanderlust.com', hashedPassword, 'Royal Hospitality Group', '+91 98765 43212', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', vendorRoleId]
  );
  const vendorUserId = vendorUserRes.rows[0].id;

  // 3. States & Cities
  const stateDelRes = await pool.query(
    `INSERT INTO states (name, code, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, "updatedAt" = NOW() RETURNING id`,
    ['Delhi', 'DL']
  );
  const stateMahRes = await pool.query(
    `INSERT INTO states (name, code, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code, "updatedAt" = NOW() RETURNING id`,
    ['Maharashtra', 'MH']
  );

  const stateDelId = stateDelRes.rows[0].id;
  const stateMahId = stateMahRes.rows[0].id;

  let cityDelRes = await pool.query(`SELECT id FROM cities WHERE name = 'New Delhi'`);
  if (cityDelRes.rows.length === 0) {
    cityDelRes = await pool.query(
      `INSERT INTO cities (name, "stateId", "imageUrl", "isPopular", "updatedAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
      ['New Delhi', stateDelId, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80', true]
    );
  }

  let cityMumRes = await pool.query(`SELECT id FROM cities WHERE name = 'Mumbai'`);
  if (cityMumRes.rows.length === 0) {
    cityMumRes = await pool.query(
      `INSERT INTO cities (name, "stateId", "imageUrl", "isPopular", "updatedAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
      ['Mumbai', stateMahId, 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80', true]
    );
  }

  const cityDelId = cityDelRes.rows[0].id;
  const cityMumId = cityMumRes.rows[0].id;

  // 4. Amenities
  const amenitiesList = [
    { name: 'Free High-Speed Wi-Fi', icon: 'wifi' },
    { name: 'Infinity Pool', icon: 'pool' },
    { name: 'Luxury Spa & Wellness', icon: 'spa' },
    { name: 'Valet Parking', icon: 'local_parking' },
    { name: '24/7 Fitness Center', icon: 'fitness_center' },
  ];

  const amenityIds: Record<string, string> = {};
  for (const item of amenitiesList) {
    let exist = await pool.query(`SELECT id FROM amenities WHERE name = $1`, [item.name]);
    if (exist.rows.length === 0) {
      exist = await pool.query(`INSERT INTO amenities (name, icon, "updatedAt") VALUES ($1, $2, NOW()) RETURNING id`, [item.name, item.icon]);
    }
    amenityIds[item.name] = exist.rows[0].id;
  }

  // 5. Hotels
  let hotelGrandRes = await pool.query(`SELECT id FROM hotels WHERE name = 'The Grand Zenith Resort & Spa'`);
  let hotelGrandId: string;

  if (hotelGrandRes.rows.length === 0) {
    const res = await pool.query(
      `INSERT INTO hotels (name, description, address, "cityId", "starRating", "pricePerNight", "discountPercent", "vendorId", "isFeatured", latitude, longitude, "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING id`,
      [
        'The Grand Zenith Resort & Spa',
        'Experience unmatched luxury with ocean and skyline views, Michelin-star dining, and ultra-comfortable suites.',
        'Connaught Place, Central Ring',
        cityDelId,
        4.9,
        3500.0,
        15,
        vendorUserId,
        true,
        28.6139,
        77.2090,
      ]
    );
    hotelGrandId = res.rows[0].id;

    for (const name of ['Free High-Speed Wi-Fi', 'Infinity Pool', 'Luxury Spa & Wellness', '24/7 Fitness Center']) {
      await pool.query(`INSERT INTO "_AmenityToHotel" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [amenityIds[name], hotelGrandId]);
    }

    await pool.query(`INSERT INTO hotel_images (url, "isPrimary", "hotelId") VALUES ($1, $2, $3)`, ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80', true, hotelGrandId]);
    await pool.query(`INSERT INTO hotel_images (url, "isPrimary", "hotelId") VALUES ($1, $2, $3)`, ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80', false, hotelGrandId]);

    await pool.query(`INSERT INTO rooms ("roomType", capacity, "pricePerNight", "availableCount", features, "hotelId", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())`, ['Presidential Suite', 4, 7500.0, 3, ['King Bed', 'City View Balcony', 'Jacuzzi'], hotelGrandId]);
    await pool.query(`INSERT INTO rooms ("roomType", capacity, "pricePerNight", "availableCount", features, "hotelId", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())`, ['Deluxe City View', 2, 3500.0, 8, ['Queen Bed', 'Smart TV', 'Mini Bar'], hotelGrandId]);
  } else {
    hotelGrandId = hotelGrandRes.rows[0].id;
  }

  // 6. Cab Services
  let cabRes = await pool.query(`SELECT id FROM cab_services WHERE "vehicleNumber" = 'DL-01-CAB-8899'`);
  let cabId: string;
  if (cabRes.rows.length === 0) {
    const res = await pool.query(
      `INSERT INTO cab_services ("vehicleName", "vehicleNumber", "cabType", "driverName", "driverPhone", "driverRating", "hasAc", "seatCapacity", "baseFare", "farePerKm", "cityId", "vendorId", "isAvailable", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) RETURNING id`,
      [
        'Mercedes-Benz E-Class Executive',
        'DL-01-CAB-8899',
        'LUXURY',
        'Robert Sterling',
        '+91 98765 40001',
        4.95,
        true,
        4,
        250.0,
        18.0,
        cityDelId,
        vendorUserId,
        true,
      ]
    );
    cabId = res.rows[0].id;
    await pool.query(`INSERT INTO cab_images (url, "cabId") VALUES ($1, $2)`, ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', cabId]);
  } else {
    cabId = cabRes.rows[0].id;
  }

  // 7. Banners
  await pool.query(
    `INSERT INTO banners (title, subtitle, "imageUrl", "buttonText", "linkUrl", "sortOrder", "isActive")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      'Discover Luxury Staycations & Chauffeur Cabs',
      'Save up to 25% on premium handpicked hotels and executive chauffeurs across India',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
      'Explore Hotels',
      '/hotels',
      1,
      true,
    ]
  );

  // 8. Coupons
  await pool.query(
    `INSERT INTO coupons (code, "discountAmount", "minOrderValue", "expiryDate")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (code) DO NOTHING`,
    ['WANDERLUST500', 500.0, 2500.0, new Date('2026-12-31')]
  );

  console.log('✅ Local PostgreSQL 16 Seeding Completed Successfully in INR (₹)!');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
