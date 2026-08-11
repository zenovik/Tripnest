# ✈️ Tripnest - Enterprise Travel & Hospitality Platform

Tripnest is a high-performance, modular, enterprise-grade Travel & Hospitality platform built with **Angular 20+** on the frontend and **NestJS & PostgreSQL** on the backend.

---

## 🌟 Key Features

### 🏢 Hotel Module
- **Search & Filter**: City, price range sliders, star rating (4.0+), amenities (Wi-Fi, Infinity Pool, Spa, Gym), and sorting.
- **Detailed Stays**: Image galleries, room category matrices, available room counts, customer reviews, and interactive booking modal.

### 🚕 Cab Booking Module
- **Fleet Selection**: Executive Sedans, Luxury SUVs, Mercedes VIP Class, EV Rickshaws.
- **Transfers & Rides**: Doorstep pickup/drop, verified driver info & photo, AC/Non-AC indicators.
- **Dynamic Fare Computation**: Automatic base fare + distance-based (per-KM) rate calculation.

### 🔐 Authentication & RBAC
- **Multi-Role Authorization**: Super Admin, Admin, Vendor, Customer.
- **Secure Auth Pipeline**: JWT token handling, Passport.js strategies, mobile OTP support.

### 📊 Enterprise Admin Dashboard
- **Real-Time Analytics**: Total hotels, total cab services, total revenue, total users, active cities count.
- **Financial Growth**: Interactive SVG revenue trend charts.
- **Full Entity CRUD**: Direct administrative tables for hotels, cabs, bookings, and users.

### 🧩 Extensible Modular Architecture
Built to support futuristic expansion for modules like **Tour Packages, Event Booking, Temple Booking, Purohit Services, E-Rickshaw, Parcel Delivery, Donations, and Food Ordering**.

---

## 🏗️ System Architecture & Stack

### Frontend
- **Framework**: Angular 20+ (Standalone Components, Signals, RxJS)
- **Styling**: SCSS, Glassmorphism design system, Dark & Light theme switching
- **Icons & Fonts**: Material Icons, Outfit & Inter Google Fonts

### Backend
- **Framework**: NestJS (TypeScript)
- **Database Layer**: PostgreSQL + Prisma ORM (18 normalized tables)
- **API Documentation**: Swagger / OpenAPI 3.0
- **Security**: Helmet, CORS, Class-Validator, JWT

---

## 🗄️ Database ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    Role ||--o{ User : "has many"
    User ||--o{ HotelBooking : "makes"
    User ||--o{ CabBooking : "makes"
    User ||--o{ Review : "writes"
    State ||--o{ City : "contains"
    City ||--o{ Hotel : "located in"
    City ||--o{ CabService : "operates in"
    Hotel ||--o{ HotelImage : "has"
    Hotel ||--o{ Room : "offers"
    Hotel ||--o{ HotelBooking : "receives"
    CabService ||--o{ CabBooking : "receives"
    HotelBooking ||--|| Payment : "settled with"
    CabBooking ||--|| Payment : "settled with"
```

---

## 🚀 Quick Start & Local Setup Guide

### 1. Active Workspace Recommendation
> Set `/Users/saud/.gemini/antigravity-ide/scratch/travel-platform` as your active workspace directory in your IDE.

### 2. Backend Setup (NestJS)

```bash
cd backend
npm install
npx prisma generate
npm run prisma:seed
npm run start:dev
```
- **Backend API**: `http://localhost:3000/api/v1`
- **Swagger Documentation**: `http://localhost:3000/api/docs`

### 3. Frontend Setup (Angular)

```bash
cd ../frontend
npm install
npm start
```
- **Web App**: `http://localhost:4200`

---

## 🔑 Environment Variables (`backend/.env`)

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/wanderlust_db?schema=public"
JWT_SECRET="super_secret_wanderlust_jwt_key_2026"
```

---

## 📄 License
Production-Ready Enterprise Boilerplate. Built with precision by Antigravity AI.
