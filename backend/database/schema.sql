-- Wanderlust Enterprise Travel Platform PostgreSQL 16 Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE roles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE roles ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE roles ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "fullName" VARCHAR(255) NOT NULL,
  "phoneNumber" VARCHAR(50) UNIQUE,
  "avatarUrl" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "roleId" UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- States Table
CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE states ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE states ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE states ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Cities Table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  "stateId" UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  "imageUrl" TEXT,
  "isPopular" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE cities ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE cities ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE cities ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  "cityId" UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  "starRating" FLOAT DEFAULT 4.0,
  "pricePerNight" FLOAT NOT NULL,
  "discountPercent" FLOAT DEFAULT 0,
  "vendorId" UUID REFERENCES users(id) ON DELETE SET NULL,
  "isFeatured" BOOLEAN DEFAULT FALSE,
  latitude FLOAT,
  longitude FLOAT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE hotels ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE hotels ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE hotels ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Hotel Images Table
CREATE TABLE IF NOT EXISTS hotel_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  "isPrimary" BOOLEAN DEFAULT FALSE,
  "hotelId" UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE
);
ALTER TABLE hotel_images ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "roomType" VARCHAR(100) NOT NULL,
  capacity INT DEFAULT 2,
  "pricePerNight" FLOAT NOT NULL,
  "availableCount" INT DEFAULT 5,
  features TEXT[] DEFAULT '{}',
  "hotelId" UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE rooms ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE rooms ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE rooms ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Amenities Table
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE amenities ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE amenities ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE amenities ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Amenity to Hotel Join Table
CREATE TABLE IF NOT EXISTS "_AmenityToHotel" (
  "A" UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  "B" UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);

-- Hotel Bookings Table
CREATE TABLE IF NOT EXISTS hotel_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingNumber" VARCHAR(100) UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  "hotelId" UUID NOT NULL REFERENCES hotels(id) ON DELETE RESTRICT,
  "roomId" UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  "checkInDate" TIMESTAMP NOT NULL,
  "checkOutDate" TIMESTAMP NOT NULL,
  guests INT DEFAULT 1,
  "totalAmount" FLOAT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE hotel_bookings ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE hotel_bookings ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE hotel_bookings ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Cab Services Table
CREATE TABLE IF NOT EXISTS cab_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vehicleName" VARCHAR(255) NOT NULL,
  "vehicleNumber" VARCHAR(100) UNIQUE NOT NULL,
  "cabType" VARCHAR(50) DEFAULT 'SEDAN',
  "driverName" VARCHAR(255) NOT NULL,
  "driverPhone" VARCHAR(50) NOT NULL,
  "driverRating" FLOAT DEFAULT 4.8,
  "hasAc" BOOLEAN DEFAULT TRUE,
  "seatCapacity" INT DEFAULT 4,
  "baseFare" FLOAT NOT NULL,
  "farePerKm" FLOAT NOT NULL,
  "cityId" UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  "vendorId" UUID REFERENCES users(id) ON DELETE SET NULL,
  "isAvailable" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE cab_services ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE cab_services ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE cab_services ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Cab Images Table
CREATE TABLE IF NOT EXISTS cab_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  "cabId" UUID NOT NULL REFERENCES cab_services(id) ON DELETE CASCADE
);
ALTER TABLE cab_images ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Cab Bookings Table
CREATE TABLE IF NOT EXISTS cab_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingNumber" VARCHAR(100) UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  "cabId" UUID NOT NULL REFERENCES cab_services(id) ON DELETE RESTRICT,
  "pickupLocation" TEXT NOT NULL,
  "dropLocation" TEXT NOT NULL,
  "pickupDateTime" TIMESTAMP NOT NULL,
  passengers INT DEFAULT 1,
  "distanceKm" FLOAT DEFAULT 10.0,
  "totalAmount" FLOAT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE cab_bookings ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE cab_bookings ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE cab_bookings ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INT DEFAULT 5,
  comment TEXT NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "hotelId" UUID REFERENCES hotels(id) ON DELETE CASCADE,
  "cabId" UUID REFERENCES cab_services(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE reviews ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE reviews ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  "imageUrl" TEXT NOT NULL,
  "buttonText" VARCHAR(100),
  "linkUrl" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "sortOrder" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE banners ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE banners ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  "discountAmount" FLOAT NOT NULL,
  "minOrderValue" FLOAT DEFAULT 0,
  "expiryDate" TIMESTAMP NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE coupons ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE coupons ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE notifications ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "transactionId" VARCHAR(100) UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount FLOAT NOT NULL,
  "paymentMethod" VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  "hotelBookingId" UUID UNIQUE REFERENCES hotel_bookings(id) ON DELETE SET NULL,
  "cabBookingId" UUID UNIQUE REFERENCES cab_bookings(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE payments ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE payments ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
ALTER TABLE settings ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE settings ALTER COLUMN "updatedAt" SET DEFAULT NOW();
