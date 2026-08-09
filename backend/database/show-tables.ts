import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://saud@localhost:5432/travel_db',
});

async function main() {
  console.log('\n📊 === WANDERLUST POSTGRESQL 16 DATABASE AUDIT ===\n');

  const tablesRes = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log(`Found ${tablesRes.rows.length} Tables in PostgreSQL Database 'travel_db':\n`);

  for (const row of tablesRes.rows) {
    const countRes = await pool.query(`SELECT COUNT(*)::int as count FROM "${row.table_name}"`);
    console.log(` ▫ ${row.table_name.padEnd(20)} : ${countRes.rows[0].count} rows`);
  }

  console.log('\n🏨 === LATEST HOTELS IN DATABASE ===');
  const hotels = await pool.query('SELECT name, "pricePerNight", "starRating", "createdAt" FROM hotels ORDER BY "createdAt" DESC LIMIT 5;');
  console.table(hotels.rows);

  console.log('\n🚕 === LATEST CABS IN DATABASE ===');
  const cabs = await pool.query('SELECT "vehicleName", "vehicleNumber", "cabType", "driverName", "baseFare" FROM cab_services ORDER BY "createdAt" DESC LIMIT 5;');
  console.table(cabs.rows);

  console.log('\n👤 === REGISTERED USERS IN DATABASE ===');
  const users = await pool.query('SELECT "fullName", email, "isActive", "createdAt" FROM users ORDER BY "createdAt" DESC LIMIT 5;');
  console.table(users.rows);

  await pool.end();
}

main().catch(err => {
  console.error('Error querying database:', err);
  process.exit(1);
});
