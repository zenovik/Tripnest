import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/platform.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page container">
      
      <!-- Account Overview Header Card -->
      <div class="profile-header-card glass-card">
        <div class="profile-avatar-wrap">
          <img [src]="user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'" alt="User Avatar" />
          <span class="role-badge">{{ user?.role?.name || 'CUSTOMER' }}</span>
        </div>

        <div class="profile-meta">
          <h1>{{ user?.fullName }}</h1>
          <p class="email"><span class="material-icons-outlined">email</span> {{ user?.email }}</p>
          <p *ngIf="user?.phoneNumber" class="phone"><span class="material-icons-outlined">phone</span> {{ user?.phoneNumber }}</p>
        </div>

        <div class="header-actions">
          <button class="btn-secondary danger" (click)="onLogout()">
            <span class="material-icons-outlined">logout</span> Logout
          </button>
        </div>
      </div>

      <!-- Main Profile Sub-Content Tabs -->
      <div class="profile-content-layout">
        
        <div class="profile-tabs">
          <button [class.active]="activeTab === 'bookings'" (click)="activeTab = 'bookings'">
            <span class="material-icons-outlined">confirmation_number</span> My Bookings
          </button>
          <button [class.active]="activeTab === 'settings'" (click)="activeTab = 'settings'">
            <span class="material-icons-outlined">person</span> Account Settings
          </button>
        </div>

        <!-- TAB 1: MY BOOKINGS -->
        <div *ngIf="activeTab === 'bookings'" class="bookings-tab-content">
          
          <h3>Hotel Stay Reservations</h3>
          <div *ngIf="hotelBookings.length === 0" class="empty-state glass-card">
            <span class="material-icons-outlined">hotel</span>
            <p>No hotel reservations found yet.</p>
          </div>

          <div *ngFor="let hb of hotelBookings" class="booking-card glass-card">
            <div class="flex-between card-top">
              <div>
                <span class="ref-no">Ref: {{ hb.bookingNumber }}</span>
                <h2>{{ hb.hotel?.name }}</h2>
                <p class="dates">{{ hb.checkInDate }} to {{ hb.checkOutDate }}</p>
              </div>
              <div class="text-right">
                <span class="status-badge" [class.success]="hb.status === 'CONFIRMED'">{{ hb.status }}</span>
                <div class="amount">₹{{ hb.totalAmount }}</div>
              </div>
            </div>
          </div>

          <h3 class="section-title">Chauffeur Cab Rides</h3>
          <div *ngIf="cabBookings.length === 0" class="empty-state glass-card">
            <span class="material-icons-outlined">directions_car</span>
            <p>No cab bookings found yet.</p>
          </div>

          <div *ngFor="let cb of cabBookings" class="booking-card glass-card">
            <div class="flex-between card-top">
              <div>
                <span class="ref-no">Ref: {{ cb.bookingNumber }}</span>
                <h2>{{ cb.cab?.vehicleName }}</h2>
                <p class="dates">{{ cb.pickupLocation }} ➔ {{ cb.dropLocation }}</p>
              </div>
              <div class="text-right">
                <span class="status-badge" [class.success]="cb.status === 'CONFIRMED'">{{ cb.status }}</span>
                <div class="amount">₹{{ cb.totalAmount }}</div>
              </div>
            </div>
          </div>

        </div>

        <!-- TAB 2: ACCOUNT SETTINGS FORM -->
        <div *ngIf="activeTab === 'settings'" class="settings-tab-content glass-card">
          <h3>Edit Personal Details</h3>
          <div class="form-grid">
            <div class="input-field">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="formName" />
            </div>
            <div class="input-field">
              <label>Email Address</label>
              <input type="email" [value]="user?.email" disabled />
            </div>
            <div class="input-field">
              <label>Phone Number</label>
              <input type="text" [(ngModel)]="formPhone" placeholder="+19876543210" />
            </div>
          </div>
          <button class="btn-gradient" (click)="saveProfile()">
            <span class="material-icons-outlined">save</span> Save Account Changes
          </button>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .profile-page { padding: 40px 20px; }

    .profile-header-card {
      padding: 30px;
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 30px;

      .profile-avatar-wrap {
        position: relative;
        img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-accent); }
        .role-badge { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); background: var(--primary-gradient); color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.65rem; font-weight: 700; }
      }

      .profile-meta {
        flex: 1;
        h1 { font-size: 1.8rem; margin-bottom: 6px; }
        p { color: var(--text-muted); font-size: 0.9rem; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
      }
    }

    .profile-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      button {
        padding: 10px 20px;
        border-radius: 20px;
        border: 1px solid var(--border-glass);
        background: var(--btn-sec-bg);
        color: var(--text-muted);
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        &.active { background: var(--primary-gradient); color: #fff; border-color: transparent; }
      }
    }

    .booking-card {
      padding: 20px;
      margin-bottom: 16px;
      .ref-no { font-size: 0.75rem; color: var(--primary-accent); font-weight: 700; }
      h2 { font-size: 1.2rem; margin: 4px 0; }
      .dates { font-size: 0.85rem; color: var(--text-muted); }
      .amount { font-size: 1.4rem; font-weight: 800; color: var(--text-main); margin-top: 6px; }
      .status-badge {
        padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; background: rgba(245, 158, 11, 0.15); color: var(--warning);
        &.success { background: rgba(16, 185, 129, 0.15); color: var(--success); }
      }
    }

    .section-title { margin-top: 30px; margin-bottom: 16px; }

    .empty-state { padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px; }

    .settings-tab-content {
      padding: 30px;
      max-width: 600px;
      h3 { font-size: 1.2rem; margin-bottom: 20px; }
      .form-grid {
        display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;
        .input-field { display: flex; flex-direction: column; gap: 6px; label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); } input { padding: 10px; border-radius: 8px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); } }
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  user: User | null = null;
  activeTab: 'bookings' | 'settings' = 'bookings';

  formName = '';
  formPhone = '';

  hotelBookings: any[] = [];
  cabBookings: any[] = [];

  ngOnInit() {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.formName = this.user.fullName;
      this.formPhone = this.user.phoneNumber || '';
    }

    const localStore = JSON.parse(localStorage.getItem('wl_local_bookings') || '{"hotelBookings":[],"cabBookings":[]}');

    this.apiService.getUserBookings().subscribe(data => {
      const serverHotels = data.hotelBookings || [];
      const serverCabs = data.cabBookings || [];

      const hotelMap = new Map();
      [...localStore.hotelBookings, ...serverHotels].forEach(h => {
        if (h && h.bookingNumber && !hotelMap.has(h.bookingNumber)) {
          hotelMap.set(h.bookingNumber, h);
        }
      });

      const cabMap = new Map();
      [...localStore.cabBookings, ...serverCabs].forEach(c => {
        if (c && c.bookingNumber && !cabMap.has(c.bookingNumber)) {
          cabMap.set(c.bookingNumber, c);
        }
      });

      this.hotelBookings = Array.from(hotelMap.values());
      this.cabBookings = Array.from(cabMap.values());
    });
  }

  saveProfile() {
    if (this.user) {
      this.user.fullName = this.formName;
      this.user.phoneNumber = this.formPhone;
      localStorage.setItem('wl_user', JSON.stringify(this.user));
      this.authService.currentUser.set(this.user);
      alert('Profile details updated successfully!');
    }
  }

  onLogout() {
    this.authService.logout();
  }
}
