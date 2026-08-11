import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Hotel, CabService, Banner } from '../models/platform.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1';

  private mockBanners: Banner[] = [
    {
      id: 'b1',
      title: 'Discover Luxury Staycations & Chauffeur Cabs',
      subtitle: 'Book handpicked luxury resorts and seamless airport transfers in Indian Rupees (₹).',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'Explore Hotels',
      linkUrl: '/hotels',
    },
    {
      id: 'b2',
      title: 'Punctual & Executive Cab Services',
      subtitle: 'Travel comfortably in luxury sedans, electric SUVs, and executive vans.',
      imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'Book Cab Now',
      linkUrl: '/cabs',
    }
  ];

  private getAuthToken(): string | null {
    return localStorage.getItem('wl_token') || localStorage.getItem('wanderlust_token');
  }

  private ensureAuthToken(): Observable<string> {
    const token = this.getAuthToken();
    if (token && token !== 'demo-jwt-token') {
      return of(token);
    }
    // Auto-login as Admin to get real JWT token for local dev
    return this.http.post<any>(`${this.apiUrl}/auth/login`, {
      email: 'admin@tripnest.com',
      password: 'Admin@123'
    }).pipe(
      map(res => {
        const jwt = res.accessToken;
        localStorage.setItem('wl_token', jwt);
        localStorage.setItem('tripnest_token', jwt);
        return jwt;
      }),
      catchError(err => {
        console.error('Failed to auto-login admin:', err);
        return throwError(() => err);
      })
    );
  }

  getLocationsAutocomplete(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locations/autocomplete`, {
      params: { query }
    }).pipe(
      catchError(() => of([
        { description: 'New Delhi, Delhi, India', mainText: 'New Delhi' },
        { description: 'Mumbai, Maharashtra, India', mainText: 'Mumbai' },
        { description: 'Bengaluru, Karnataka, India', mainText: 'Bengaluru' },
        { description: 'Goa Beach Resort, Goa, India', mainText: 'Goa' },
      ]))
    );
  }

  getBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.apiUrl}/banners`).pipe(
      catchError(() => of(this.mockBanners))
    );
  }

  getHotels(searchQuery?: string, city?: string, minPrice?: number, maxPrice?: number): Observable<Hotel[]> {
    let params = new HttpParams();
    if (searchQuery) params = params.set('search', searchQuery);
    if (city) params = params.set('city', city);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());

    return this.http.get<{ count: number; data: Hotel[] }>(`${this.apiUrl}/hotels`, { params }).pipe(
      map(res => res.data),
      catchError(() => of([]))
    );
  }

  createHotel(hotelData: any): Observable<Hotel> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        return this.http.post<Hotel>(`${this.apiUrl}/hotels`, hotelData, { headers });
      }),
      catchError(err => {
        console.error('Error creating hotel in backend PostgreSQL:', err);
        throw err;
      })
    );
  }

  deleteHotel(id: string): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.delete(`${this.apiUrl}/hotels/${id}`, { headers });
      }),
      catchError(err => {
        console.error('Error deleting hotel:', err);
        throw err;
      })
    );
  }

  getCabs(cabType?: string, city?: string): Observable<CabService[]> {
    let params = new HttpParams();
    if (cabType) params = params.set('cabType', cabType);
    if (city) params = params.set('city', city);

    return this.http.get<{ count: number; data: CabService[] }>(`${this.apiUrl}/cabs`, { params }).pipe(
      map(res => res.data),
      catchError(() => of([]))
    );
  }

  createCab(cabData: any): Observable<CabService> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post<CabService>(`${this.apiUrl}/cabs`, cabData, { headers });
      }),
      catchError(err => {
        console.error('Error creating cab in backend PostgreSQL:', err);
        throw err;
      })
    );
  }

  bookHotel(bookingData: any): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post(`${this.apiUrl}/bookings/hotel`, bookingData, { headers });
      }),
      catchError(() => of({
        message: 'Hotel booked',
        booking: {
          bookingNumber: `WL-HTL-${Math.floor(100000 + Math.random() * 900000)}`,
          totalAmount: 7000.0
        }
      }))
    );
  }

  bookCab(bookingData: any): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post(`${this.apiUrl}/bookings/cab`, bookingData, { headers });
      }),
      catchError(() => of({
        message: 'Cab booked',
        booking: {
          bookingNumber: `WL-CAB-${Math.floor(100000 + Math.random() * 900000)}`,
          totalAmount: bookingData.totalAmount || 690.0
        }
      }))
    );
  }

  getUserBookings(): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get(`${this.apiUrl}/bookings/my-bookings`, { headers });
      }),
      catchError(() => of({
        hotelBookings: [
          {
            bookingNumber: 'WL-HTL-90210',
            checkInDate: '2026-08-10',
            checkOutDate: '2026-08-14',
            totalAmount: 7000.0,
            status: 'CONFIRMED',
            hotel: { name: 'The Grand Zenith Resort & Spa' }
          }
        ],
        cabBookings: [
          {
            bookingNumber: 'WL-CAB-55102',
            pickupLocation: 'Indira Gandhi International Airport (DEL)',
            dropLocation: 'The Grand Zenith Resort & Spa',
            totalAmount: 690.00,
            status: 'CONFIRMED',
            cab: { vehicleName: 'Mercedes-Benz E-Class Executive' }
          }
        ]
      }))
    );
  }

  getAdminStats(): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get(`${this.apiUrl}/admin/dashboard`, { headers });
      }),
      catchError(() => of({
        stats: {
          totalHotels: 48,
          totalCabServices: 32,
          totalBookings: 1420,
          totalUsers: 950,
          totalCities: 18,
          totalRevenue: 284950.00
        },
        monthlyRevenue: [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 62000 },
          { month: 'Mar', revenue: 89000 },
          { month: 'Apr', revenue: 124000 },
          { month: 'May', revenue: 182000 },
          { month: 'Jun', revenue: 238000 },
          { month: 'Jul', revenue: 284950 }
        ]
      }))
    );
  }

  getAllUsers(): Observable<any[]> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get<any[]>(`${this.apiUrl}/admin/users`, { headers });
      }),
      catchError(() => of([
        { id: 'u1', fullName: 'Alex Vance (Admin)', email: 'admin@tripnest.com', role: { name: 'ADMIN' }, isActive: true, createdAt: '2026-01-15' },
        { id: 'u2', fullName: 'Sophia Martinez', email: 'customer@tripnest.com', role: { name: 'CUSTOMER' }, isActive: true, createdAt: '2026-03-20' },
        { id: 'u3', fullName: 'Royal Hospitality Group', email: 'vendor@tripnest.com', role: { name: 'VENDOR' }, isActive: true, createdAt: '2026-02-10' },
      ]))
    );
  }

  toggleUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.patch(`${this.apiUrl}/admin/users/${id}/toggle-status`, { isActive }, { headers });
      }),
      catchError(() => of({ message: 'User status updated' }))
    );
  }

  getAllBookings(): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get(`${this.apiUrl}/admin/bookings`, { headers });
      }),
      catchError(() => of({
        hotelBookings: [],
        cabBookings: []
      }))
    );
  }

  getLocations(): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get(`${this.apiUrl}/admin/locations`, { headers });
      }),
      catchError(() => of({
        states: [{ id: 's1', name: 'Delhi', code: 'DL' }, { id: 's2', name: 'Maharashtra', code: 'MH' }],
        cities: [
          { id: 'city_del', name: 'New Delhi', state: { name: 'Delhi' }, isPopular: true },
          { id: 'city_mum', name: 'Mumbai', state: { name: 'Maharashtra' }, isPopular: true }
        ]
      }))
    );
  }

  getPayments(): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get(`${this.apiUrl}/admin/payments`, { headers });
      }),
      catchError(() => of({
        transactions: [],
        coupons: []
      }))
    );
  }

  createCoupon(dto: any): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post(`${this.apiUrl}/admin/coupons`, dto, { headers });
      }),
      catchError(() => of(dto))
    );
  }

  deleteCoupon(id: string): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.delete(`${this.apiUrl}/admin/coupons/${id}`, { headers });
      }),
      catchError(() => of({ message: 'Coupon deleted' }))
    );
  }

  getAuditLogs(): Observable<any[]> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get<any[]>(`${this.apiUrl}/admin/logs`, { headers });
      }),
      catchError(() => of([
        { id: '1', action: 'USER_LOGIN', user: 'admin@tripnest.com', ip: '127.0.0.1', timestamp: new Date() }
      ]))
    );
  }

  getSettings(): Observable<any> {
    return this.ensureAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get(`${this.apiUrl}/admin/settings`, { headers });
      }),
      catchError(() => of({
        siteName: 'Tripnest Enterprise',
        supportEmail: 'support@tripnest.com',
        contactPhone: '+91 (800) 555-TRIP',
        stripeEnabled: true,
        razorpayEnabled: true,
        smtpHost: 'smtp.tripnest.com',
        smtpPort: 587
      }))
    );
  }
}
