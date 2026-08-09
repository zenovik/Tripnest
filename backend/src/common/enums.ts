export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  LUXURY = 'LUXURY',
  HATCHBACK = 'HATCHBACK',
  EV_RICKSHAW = 'EV_RICKSHAW',
}
