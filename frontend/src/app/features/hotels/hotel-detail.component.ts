import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Hotel } from '../../core/models/platform.models';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="hotel-detail-page container">
      
      <!-- Back Navigation Bar -->
      <div class="back-bar">
        <a routerLink="/hotels" class="btn-back">
          <span class="material-icons-outlined">arrow_back</span> Back to Hotels List
        </a>
      </div>

      <div *ngIf="loading" class="loading-state glass-card">
        <span class="spinner"></span>
        <p>Loading Property Details...</p>
      </div>

      <div *ngIf="!loading && hotel" class="detail-layout">
        
        <!-- Left: Image Gallery & Description -->
        <div class="main-content">
          
          <!-- Header Banner -->
          <div class="property-header">
            <div class="flex-between">
              <span class="city-badge"><span class="material-icons-outlined">place</span> {{ hotel.city.name }}</span>
              <span class="rating-chip">★ {{ hotel.starRating }} Rating</span>
            </div>
            <h1 class="hotel-title">{{ hotel.name }}</h1>
            <p class="hotel-address">{{ hotel.address }}</p>
          </div>

          <!-- Hero Image Gallery Slider & Thumbnails -->
          <div class="gallery-wrapper glass-card">
            <div class="active-image-wrap">
              <img [src]="activeImageUrl" [alt]="hotel.name" />
              <div *ngIf="hotel.discountPercent > 0" class="discount-badge">
                {{ hotel.discountPercent }}% OFF SPECIAL DEAL
              </div>
            </div>
            <div class="thumbnails-grid">
              <img 
                *ngFor="let img of galleryImages" 
                [src]="img" 
                [class.selected]="activeImageUrl === img" 
                (click)="activeImageUrl = img"
                alt="Thumbnail" 
              />
            </div>
          </div>

          <!-- Amenities List -->
          <div class="amenities-section glass-card">
            <h3>Property Amenities</h3>
            <div class="amenities-grid">
              <div *ngFor="let a of hotel.amenities" class="amenity-item">
                <span class="material-icons-outlined icon">{{ a.icon || 'done' }}</span>
                <span>{{ a.name }}</span>
              </div>
            </div>
          </div>

          <!-- Room Categories & Live Rate Selector -->
          <div class="rooms-section glass-card">
            <h3>Available Rooms & Suites</h3>
            <div class="rooms-grid">
              <div *ngFor="let r of roomsList" class="room-card" [class.selected]="selectedRoom?.id === r.id" (click)="selectedRoom = r">
                <div class="flex-between">
                  <div>
                    <h4>{{ r.roomType }}</h4>
                    <p class="room-capacity">Capacity: {{ r.capacity }} Guests • {{ r.features?.join(' • ') }}</p>
                  </div>
                  <div class="room-price-box">
                    <strong class="price">₹{{ r.pricePerNight }}</strong>
                    <small>/ night</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Location & Google Maps Card -->
          <div class="location-card glass-card">
            <h3>Location & Nearby Attractions</h3>
            <p>{{ hotel.address }}</p>
            <div class="map-placeholder">
              <span class="material-icons-outlined map-icon">map</span>
              <p>Google Maps Location Coordinates: 28.6139° N, 77.2090° E (Connaught Place, New Delhi)</p>
            </div>
          </div>

        </div>

        <!-- Right: Booking Summary Sticky Sidebar -->
        <div class="booking-sidebar glass-card">
          <div class="sidebar-price-header">
            <span class="price-amount">₹{{ selectedRoom ? selectedRoom.pricePerNight : hotel.pricePerNight }}</span>
            <span class="price-unit">/ night</span>
          </div>

          <div class="sidebar-form">
            <div class="input-field">
              <label>Check-In Date</label>
              <input type="date" [(ngModel)]="checkInDate" />
            </div>
            <div class="input-field">
              <label>Check-Out Date</label>
              <input type="date" [(ngModel)]="checkOutDate" />
            </div>
            <div class="input-field">
              <label>Guests</label>
              <select [(ngModel)]="guestsCount">
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </div>
          </div>

          <div class="sidebar-total-box">
            <div class="flex-between">
              <span>Selected Room:</span>
              <strong>{{ selectedRoom ? selectedRoom.roomType : 'Standard Suite' }}</strong>
            </div>
            <div class="flex-between total-row">
              <span>Estimated Stay Total:</span>
              <strong class="total-price">₹{{ (selectedRoom ? selectedRoom.pricePerNight : hotel.pricePerNight) * 3 }}</strong>
            </div>
          </div>

          <button class="btn-gradient full-width" (click)="proceedToCheckout()">
            <span class="material-icons-outlined">bookmark_add</span> Book This Room Now
          </button>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .hotel-detail-page { padding: 40px 20px; }

    .back-bar { margin-bottom: 24px; }
    .btn-back { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-muted); text-decoration: none; &:hover { color: var(--text-main); } }

    .detail-layout { display: grid; grid-template-columns: 1fr 360px; gap: 30px; }

    .property-header {
      margin-bottom: 24px;
      .city-badge { font-size: 0.85rem; font-weight: 700; color: var(--primary-accent); }
      .rating-chip { background: rgba(245,158,11,0.15); color: #f59e0b; font-weight: 800; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
      .hotel-title { font-size: 2.4rem; margin: 8px 0 4px 0; }
      .hotel-address { color: var(--text-muted); }
    }

    .gallery-wrapper {
      padding: 20px; margin-bottom: 30px;
      .active-image-wrap {
        position: relative; height: 400px; border-radius: 16px; overflow: hidden; margin-bottom: 14px;
        img { width: 100%; height: 100%; object-fit: cover; }
        .discount-badge { position: absolute; top: 14px; left: 14px; background: #ef4444; color: #fff; font-weight: 800; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; }
      }
      .thumbnails-grid {
        display: flex; gap: 12px;
        img { width: 90px; height: 60px; border-radius: 10px; object-fit: cover; cursor: pointer; border: 2px solid transparent; opacity: 0.7; transition: all 0.2s ease;
          &.selected { border-color: var(--primary-accent); opacity: 1; }
        }
      }
    }

    .amenities-section {
      padding: 24px; margin-bottom: 30px; h3 { font-size: 1.2rem; margin-bottom: 16px; }
      .amenities-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
        .amenity-item { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; font-weight: 600; .icon { color: var(--primary-accent); } }
      }
    }

    .rooms-section {
      padding: 24px; margin-bottom: 30px; h3 { font-size: 1.2rem; margin-bottom: 16px; }
      .rooms-grid {
        display: flex; flex-direction: column; gap: 12px;
        .room-card {
          padding: 16px 20px; border-radius: 16px; border: 1px solid var(--border-glass); background: rgba(255,255,255,0.02); cursor: pointer; transition: all 0.2s ease;
          &.selected { border-color: var(--primary-accent); background: rgba(99,102,241,0.08); }
          h4 { font-size: 1.1rem; }
          .room-capacity { font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; }
          .room-price-box { text-align: right; .price { font-size: 1.4rem; color: #10b981; } small { color: var(--text-muted); } }
        }
      }
    }

    .location-card {
      padding: 24px; h3 { font-size: 1.2rem; margin-bottom: 8px; } p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px; }
      .map-placeholder { padding: 40px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px dashed var(--border-glass); text-align: center; color: var(--text-muted); .map-icon { font-size: 48px; color: var(--primary-accent); margin-bottom: 8px; } }
    }

    .booking-sidebar {
      padding: 24px; height: fit-content; sticky: top 90px;
      .sidebar-price-header { margin-bottom: 20px; .price-amount { font-size: 2rem; font-weight: 800; color: var(--text-main); } .price-unit { color: var(--text-muted); } }
      .sidebar-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
      .input-field { display: flex; flex-direction: column; gap: 6px; label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); } input, select { padding: 10px; border-radius: 10px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); } }
      .sidebar-total-box { padding: 14px; background: rgba(255,255,255,0.04); border-radius: 12px; margin-bottom: 20px; font-size: 0.9rem; .total-row { margin-top: 8px; font-weight: 800; font-size: 1.1rem; .total-price { color: #10b981; } } }
      .full-width { width: 100%; padding: 14px; }
    }

    .loading-state { padding: 60px; text-align: center; }
    .spinner { display: inline-block; width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: var(--primary-accent); animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class HotelDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  apiService = inject(ApiService);

  hotelId = '';
  hotel: Hotel | null = null;
  loading = true;

  activeImageUrl = '';
  galleryImages: string[] = [];
  roomsList: any[] = [];
  selectedRoom: any = null;

  checkInDate = '2026-08-10';
  checkOutDate = '2026-08-13';
  guestsCount = '2';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.hotelId = params['id'];
      this.loadHotelDetail();
    });
  }

  loadHotelDetail() {
    this.loading = true;
    this.apiService.getHotels().subscribe(hotels => {
      const found = hotels.find(h => h.id === this.hotelId) || hotels[0];
      this.hotel = found;
      this.galleryImages = found.images ? found.images.map(i => i.url) : [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
      ];
      this.activeImageUrl = this.galleryImages[0];
      this.roomsList = found.rooms || [
        { id: 'r1', roomType: 'Presidential Suite', capacity: 4, pricePerNight: 7500, features: ['King Bed', 'Balcony View', 'Jacuzzi'] },
        { id: 'r2', roomType: 'Deluxe City View', capacity: 2, pricePerNight: found.pricePerNight || 3500, features: ['Queen Bed', 'Smart TV', 'Mini Bar'] }
      ];
      this.selectedRoom = this.roomsList[0];
      this.loading = false;
    });
  }

  proceedToCheckout() {
    if (!this.hotel) return;
    this.router.navigate(['/checkout'], {
      queryParams: {
        type: 'hotel',
        id: this.hotel.id,
        name: this.hotel.name,
        subtitle: `${this.selectedRoom?.roomType || 'Deluxe Room'} • ${this.hotel.address}`,
        price: this.selectedRoom?.pricePerNight || this.hotel.pricePerNight
      }
    });
  }
}
