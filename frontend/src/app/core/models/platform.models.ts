export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: {
    name: 'SUPER_ADMIN' | 'ADMIN' | 'VENDOR' | 'CUSTOMER';
  };
}

export interface HotelImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Room {
  id: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  availableCount: number;
  features: string[];
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  cityId?: string;
  city: { name: string };
  starRating: number;
  pricePerNight: number;
  discountPercent: number;
  isFeatured?: boolean;
  images: HotelImage[];
  rooms: Room[];
  amenities: Amenity[];
}

export interface CabService {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  cabType: 'SEDAN' | 'SUV' | 'LUXURY' | 'HATCHBACK' | 'EV_RICKSHAW';
  driverName: string;
  driverPhone: string;
  driverRating: number;
  hasAc: boolean;
  seatCapacity: number;
  baseFare: number;
  farePerKm: number;
  cityId?: string;
  city: { name: string };
  images: { url: string }[];
}

export interface HotelBooking {
  id: string;
  bookingNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  hotel: Hotel;
  room: Room;
}

export interface CabBooking {
  id: string;
  bookingNumber: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDateTime: string;
  passengers: number;
  distanceKm: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  cab: CabService;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  linkUrl?: string;
}
