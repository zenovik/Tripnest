import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Hotel } from '../../core/models/platform.models';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="hotels-page container">
      
      <!-- Page Header -->
      <div class="page-title-area">
        <h1>Luxury Hotels & Resort Stays</h1>
        <p>Explore top-rated 5-star hotels, oceanfront villas, and executive suites.</p>
      </div>

      <div class="hotels-layout">
        
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar glass-card">
          <div class="filter-header flex-between">
            <h3><span class="material-icons-outlined">tune</span> Filters</h3>
            <button class="btn-reset" (click)="resetFilters()">Reset All</button>
          </div>

          <!-- City Search Filter -->
          <div class="filter-group">
            <label>City / Location</label>
            <input type="text" [(ngModel)]="selectedCity" (input)="applyFilters()" placeholder="Filter by city..." />
          </div>

          <!-- Price Range Filter -->
          <div class="filter-group">
            <label>Max Price Per Night ($)</label>
            <input type="range" min="50" max="600" step="10" [(ngModel)]="maxPrice" (change)="applyFilters()" />
            <div class="price-val flex-between">
              <span>$50</span>
              <strong class="text-gradient">\${{ maxPrice }}</strong>
            </div>
          </div>

          <!-- Star Rating Filter -->
          <div class="filter-group">
            <label>Minimum Star Rating</label>
            <select [(ngModel)]="minRating" (change)="applyFilters()">
              <option value="0">All Ratings</option>
              <option value="4.0">4.0 Stars & Above</option>
              <option value="4.5">4.5 Stars & Above</option>
              <option value="4.8">4.8+ Ultra Luxury</option>
            </select>
          </div>

          <!-- Amenities Filter -->
          <div class="filter-group">
            <label>Featured Amenities</label>
            <div class="checkbox-list">
              <label><input type="checkbox" [(ngModel)]="wifiOnly" (change)="applyFilters()" /> Free High-Speed Wi-Fi</label>
              <label><input type="checkbox" [(ngModel)]="poolOnly" (change)="applyFilters()" /> Infinity Swimming Pool</label>
              <label><input type="checkbox" [(ngModel)]="spaOnly" (change)="applyFilters()" /> Luxury Spa & Wellness</label>
            </div>
          </div>

        </aside>

        <!-- Hotels Main Content Grid -->
        <main class="hotels-grid-container">
          
          <div *ngIf="loading" class="loading-state">
            <span class="material-icons-outlined spin">refresh</span> Loading luxury hotels...
          </div>

          <div *ngIf="!loading && hotels.length === 0" class="empty-state glass-card">
            <span class="material-icons-outlined">hotel_class</span>
            <h3>No Stays Match Your Filter Criteria</h3>
            <p>Try clearing your price range or location filters.</p>
            <button class="btn-gradient" (click)="resetFilters()">View All Hotels</button>
          </div>

          <!-- Hotel Card List -->
          <div *ngFor="let hotel of hotels" class="hotel-card glass-card">
            
            <div class="card-image-wrap">
              <img [src]="hotel.images[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'" [alt]="hotel.name" />
              <div *ngIf="hotel.discountPercent > 0" class="discount-badge">
                {{ hotel.discountPercent }}% OFF
              </div>
              <button class="fav-btn" (click)="toggleFav(hotel)" [class.active]="favs.has(hotel.id)">
                <span class="material-icons-outlined">{{ favs.has(hotel.id) ? 'favorite' : 'favorite_border' }}</span>
              </button>
            </div>

            <div class="card-details">
              <div class="card-header flex-between">
                <span class="hotel-city"><span class="material-icons-outlined">place</span> {{ hotel.city.name }}</span>
                <span class="rating-star">
                  <span class="material-icons-outlined">star</span> {{ hotel.starRating }}
                </span>
              </div>

              <h2 class="hotel-title">{{ hotel.name }}</h2>
              <p class="hotel-address">{{ hotel.address }}</p>
              <p class="hotel-desc">{{ hotel.description }}</p>

              <div class="amenities-tags">
                <span *ngFor="let a of hotel.amenities" class="badge-tag">
                  <span class="material-icons-outlined icon-sm">{{ a.icon || 'done' }}</span> {{ a.name }}
                </span>
              </div>

              <div class="card-footer flex-between">
                <div class="price-box">
                  <span class="price-amount">₹{{ hotel.pricePerNight }}</span>
                  <span class="price-unit">/ night</span>
                </div>
                <div class="action-btns flex-gap">
                  <a [routerLink]="['/hotels', hotel.id]" class="btn-secondary">
                    <span class="material-icons-outlined">info</span> View Details
                  </a>
                  <button class="btn-gradient" (click)="openBookingModal(hotel)">
                    <span class="material-icons-outlined">bookmark_add</span> Book Stay
                  </button>
                </div>
              </div>
            </div>

          </div>

        </main>

      </div>

      <!-- Booking Modal Dialog -->
      <div *ngIf="selectedHotelModal" class="modal-overlay">
        <div class="modal-card glass-card">
          <div class="modal-header flex-between">
            <h2>Book Your Stay at {{ selectedHotelModal.name }}</h2>
            <button class="btn-close" (click)="selectedHotelModal = null">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <p class="modal-subtitle">{{ selectedHotelModal.address }}</p>
            
            <div class="room-selector">
              <h4>Choose Room Category</h4>
              <div *ngFor="let room of selectedHotelModal.rooms" class="room-option-card" [class.selected]="selectedRoomId === room.id" (click)="selectedRoomId = room.id">
                <div class="flex-between">
                  <div>
                    <strong>{{ room.roomType }}</strong>
                    <div class="room-features">
                      <span *ngFor="let f of room.features">{{ f }} • </span>
                    </div>
                  </div>
                  <div class="room-price">₹{{ room.pricePerNight }} / night</div>
                </div>
              </div>
            </div>

            <div class="booking-dates-grid">
              <div class="input-field">
                <label>Check In Date</label>
                <input type="date" [(ngModel)]="modalCheckIn" />
              </div>
              <div class="input-field">
                <label>Check Out Date</label>
                <input type="date" [(ngModel)]="modalCheckOut" />
              </div>
              <div class="input-field">
                <label>Promo Coupon Code</label>
                <input type="text" [(ngModel)]="couponCode" placeholder="e.g. TRIPNEST20" />
              </div>
            </div>

            <div class="modal-footer flex-between">
              <div>
                <span class="total-label">Total Amount:</span>
                <strong class="total-price">₹{{ selectedHotelModal.pricePerNight }}</strong>
              </div>
              <button class="btn-gradient" (click)="confirmBooking()">
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .hotels-page { padding: 40px 20px; }

    .page-title-area {
      margin-bottom: 30px;
      h1 { font-size: 2.5rem; }
      p { color: var(--text-muted); }
    }

    .hotels-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 30px;
    }

    .filters-sidebar {
      padding: 24px;
      height: fit-content;

      .filter-header {
        margin-bottom: 20px;
        border-bottom: 1px solid var(--border-glass);
        padding-bottom: 12px;

        .btn-reset {
          background: transparent;
          border: none;
          color: var(--primary-accent);
          font-weight: 600;
          cursor: pointer;
        }
      }

      .filter-group {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }

        input[type="text"], select {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--text-main);
          outline: none;
        }

        .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.85rem;
        }
      }
    }

    .hotels-grid-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .hotel-card {
      display: grid;
      grid-template-columns: 320px 1fr;
      overflow: hidden;
      border-radius: 20px;

      .card-image-wrap {
        position: relative;
        height: 100%;

        img { width: 100%; height: 100%; object-fit: cover; }

        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--danger);
          color: #fff;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .fav-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.4);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          &.active { color: var(--danger); }
        }
      }

      .card-details {
        padding: 24px;
        display: flex;
        flex-direction: column;

        .hotel-city { font-size: 0.8rem; color: var(--primary-accent); font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .hotel-title { font-size: 1.4rem; margin: 4px 0; }
        .hotel-address { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; }
        .hotel-desc { font-size: 0.9rem; color: var(--text-subtle); margin-bottom: 16px; line-clamp: 2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .amenities-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }

        .price-amount { font-size: 1.6rem; font-weight: 800; font-family: var(--font-primary); color: var(--text-main); }
        .price-unit { font-size: 0.85rem; color: var(--text-muted); }
      }
    }

    .modal-card {
      width: 100%;
      max-width: 600px;
      padding: 30px;
      background: var(--modal-bg);
      border: 1px solid var(--border-glass);

      .modal-header { margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; }
      .btn-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; }

      .room-option-card {
        background: var(--input-bg);
        border: 1px solid var(--border-glass);
        padding: 14px;
        border-radius: 12px;
        margin-bottom: 10px;
        cursor: pointer;
        &.selected { border-color: var(--primary-accent); background: rgba(99, 102, 241, 0.15); }
      }

      .booking-dates-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        margin: 20px 0;

        input {
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          padding: 10px;
          border-radius: 8px;
          color: var(--text-main);
          width: 100%;
        }
      }

      .modal-footer { border-top: 1px solid var(--border-glass); padding-top: 16px; margin-top: 20px; }
      .total-price { font-size: 1.5rem; color: var(--primary-accent); margin-left: 8px; }
    }

    @media (max-width: 992px) {
      .hotels-layout { grid-template-columns: 1fr; }
      .hotel-card { grid-template-columns: 1fr; }
    }
  `]
})
export class HotelListComponent implements OnInit {
  apiService = inject(ApiService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  hotels: Hotel[] = [];
  loading = true;
  favs = new Set<string>();

  // Filter Models
  selectedCity = '';
  maxPrice = 500;
  minRating = 0;
  wifiOnly = false;
  poolOnly = false;
  spaOnly = false;

  // Booking Modal
  selectedHotelModal: Hotel | null = null;
  selectedRoomId = '';
  modalCheckIn = '2026-08-10';
  modalCheckOut = '2026-08-14';
  couponCode = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['city']) this.selectedCity = params['city'];
      this.loadHotels();
    });
  }

  loadHotels() {
    this.loading = true;
    this.apiService.getHotels(undefined, this.selectedCity, undefined, this.maxPrice).subscribe(data => {
      this.hotels = data;
      this.loading = false;
    });
  }

  applyFilters() {
    this.loadHotels();
  }

  resetFilters() {
    this.selectedCity = '';
    this.maxPrice = 500;
    this.minRating = 0;
    this.wifiOnly = false;
    this.poolOnly = false;
    this.spaOnly = false;
    this.loadHotels();
  }

  toggleFav(hotel: Hotel) {
    if (this.favs.has(hotel.id)) this.favs.delete(hotel.id);
    else this.favs.add(hotel.id);
  }

  openBookingModal(hotel: Hotel) {
    this.selectedHotelModal = hotel;
    if (hotel.rooms && hotel.rooms.length > 0) {
      this.selectedRoomId = hotel.rooms[0].id;
    }
  }

  confirmBooking() {
    if (!this.selectedHotelModal) return;
    const hotel = this.selectedHotelModal;
    this.selectedHotelModal = null;
    this.router.navigate(['/checkout'], {
      queryParams: {
        type: 'hotel',
        name: hotel.name,
        subtitle: `${hotel.address} • Check-in: ${this.modalCheckIn}`,
        price: hotel.pricePerNight
      }
    });
  }
}
