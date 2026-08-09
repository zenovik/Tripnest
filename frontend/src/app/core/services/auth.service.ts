import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/platform.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/v1/auth';

  currentUser = signal<User | null>(this.loadUserFromStorage());

  isLoggedIn = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => {
    const role = this.currentUser()?.role?.name;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  });
  isVendor = computed(() => this.currentUser()?.role?.name === 'VENDOR');

  private loadUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('wl_user');
    const storedToken = localStorage.getItem('wl_token');
    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.user && res.accessToken) {
          this.setSession(res.user, res.accessToken);
        }
      }),
      catchError((err) => {
        const errorMsg = err?.error?.message || 'Invalid email or password';
        return throwError(() => errorMsg);
      })
    );
  }

  register(userData: { email: string; password: string; fullName: string; phoneNumber?: string; roleName?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        if (res.user && res.accessToken) {
          this.setSession(res.user, res.accessToken);
        }
      }),
      catchError((err) => {
        const errorMsg = err?.error?.message || 'Registration failed. Please try again.';
        return throwError(() => errorMsg);
      })
    );
  }

  sendOtp(phoneNumber: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/otp/send`, { phoneNumber });
  }

  verifyOtp(phoneNumber: string, otpCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/otp/verify`, { phoneNumber, otpCode }).pipe(
      tap((res) => {
        if (res.user && res.accessToken) {
          this.setSession(res.user, res.accessToken);
        }
      })
    );
  }

  private setSession(user: User, token: string) {
    this.currentUser.set(user);
    localStorage.setItem('wl_user', JSON.stringify(user));
    localStorage.setItem('wl_token', token);
    localStorage.setItem('wanderlust_token', token);
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('wl_user');
    localStorage.removeItem('wl_token');
    localStorage.removeItem('wanderlust_token');
    this.router.navigate(['/login']);
  }
}
