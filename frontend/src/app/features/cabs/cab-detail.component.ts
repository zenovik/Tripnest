import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CabService } from '../../core/models/platform.models';

@Component({
  selector: 'app-cab-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="cab-detail-page container">
      
      <!-- Back Navigation Bar -->
      <div class="back-bar">
        <a routerLink="/cabs" class="btn-back">
          <span class="material-icons-outlined">arrow_back</span> Back to Cabs List
        </a>
      </div>

      <div *ngIf="loading" class="loading-state glass-card">
        <span class="spinner"></span>
        <p>Loading Vehicle Specifications...</p>
      </div>

      <div *ngIf="!loading && cab" class="detail-layout">
        
        <!-- Left: Vehicle Specs & Driver Details -->
        <div class="main-content">
          
          <div class="vehicle-header">
            <span class="type-badge">{{ cab.cabType }}</span>
            <h1 class="vehicle-title">{{ cab.vehicleName }}</h1>
            <p class="vehicle-number">Reg Number: <strong>{{ cab.vehicleNumber }}</strong></p>
          </div>

          <!-- Hero Vehicle Image Card -->
          <div class="vehicle-image-card glass-card">
            <img [src]="cab.images && cab.images[0]?.url ? cab.images[0].url : 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80'" [alt]="cab.vehicleName" />
          </div>

          <!-- Specifications Grid -->
          <div class="specs-section glass-card">
            <h3>Vehicle Features & Comfort</h3>
            <div class="specs-grid">
              <div class="spec-item">
                <span class="material-icons-outlined icon">airline_seat_recline_normal</span>
                <div>
                  <strong>Seating Capacity</strong>
                  <small>{{ cab.seatCapacity }} Passengers</small>
                </div>
              </div>
              <div class="spec-item">
                <span class="material-icons-outlined icon">ac_unit</span>
                <div>
                  <strong>Air Conditioning</strong>
                  <small>{{ cab.hasAc ? 'Climate Control AC' : 'Non-AC' }}</small>
                </div>
              </div>
              <div class="spec-item">
                <span class="material-icons-outlined icon">luggage</span>
                <div>
                  <strong>Luggage Boot Space</strong>
                  <small>3 Large Suitcases</small>
                </div>
              </div>
              <div class="spec-item">
                <span class="material-icons-outlined icon">shield</span>
                <div>
                  <strong>Safety Insurance</strong>
                  <small>Commercial Travel Cover</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Verified Chauffeur Driver Profile Card -->
          <div class="driver-card glass-card">
            <h3>Assigned Chauffeur Driver</h3>
            <div class="driver-profile">
              <div class="driver-avatar">
                <span class="material-icons-outlined">person</span>
              </div>
              <div class="driver-info">
                <h4>{{ cab.driverName }}</h4>
                <div class="driver-tags">
                  <span class="badge-tag">★ {{ cab.driverRating }} Driver Rating</span>
                  <span class="badge-tag green">Verified Professional</span>
                </div>
                <p class="phone"><span class="material-icons-outlined icon-sm">phone</span> {{ cab.driverPhone }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Fare Estimator & Booking Sidebar -->
        <div class="booking-sidebar glass-card">
          <div class="sidebar-price-header">
            <span class="price-amount">₹{{ cab.baseFare }}</span>
            <span class="price-unit">Base Fare (+₹{{ cab.farePerKm }}/km)</span>
          </div>

          <div class="route-form">
            <div class="input-field">
              <label>Pickup Location</label>
              <input type="text" [(ngModel)]="pickupLoc" (input)="recalculateFare()" />
            </div>
            <div class="input-field">
              <label>Drop Off Location</label>
              <input type="text" [(ngModel)]="dropLoc" (input)="recalculateFare()" />
            </div>
            <div class="input-field">
              <label>Estimated Distance (KM)</label>
              <input type="number" [(ngModel)]="distanceKm" (input)="recalculateFare()" />
            </div>
          </div>

          <!-- Live Fare Breakdown -->
          <div class="fare-breakdown-box">
            <div class="flex-between row">
              <span>Base Minimum Fare:</span>
              <strong>₹{{ cab.baseFare }}</strong>
            </div>
            <div class="flex-between row">
              <span>Distance Charge ({{ distanceKm }} km x ₹{{ cab.farePerKm }}):</span>
              <strong>₹{{ distanceKm * cab.farePerKm }}</strong>
            </div>
            <div class="divider"></div>
            <div class="flex-between total-row">
              <span>Estimated Total Fare:</span>
              <strong class="total-price">₹{{ computedTotal }}</strong>
            </div>
          </div>

          <button class="btn-gradient full-width" (click)="proceedToCheckout()">
            <span class="material-icons-outlined">directions_car</span> Proceed to Book Ride
          </button>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .cab-detail-page { padding: 40px 20px; }

    .back-bar { margin-bottom: 24px; }
    .btn-back { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-muted); text-decoration: none; &:hover { color: var(--text-main); } }

    .detail-layout { display: grid; grid-template-columns: 1fr 380px; gap: 30px; }

    .vehicle-header {
      margin-bottom: 24px;
      .type-badge { background: rgba(99,102,241,0.15); color: var(--primary-accent); font-weight: 800; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; display: inline-block; margin-bottom: 6px; }
      .vehicle-title { font-size: 2.2rem; margin-bottom: 4px; }
      .vehicle-number { color: var(--text-muted); font-size: 0.9rem; strong { color: var(--text-main); } }
    }

    .vehicle-image-card {
      height: 380px; border-radius: 24px; overflow: hidden; margin-bottom: 30px;
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .specs-section {
      padding: 24px; margin-bottom: 30px; h3 { font-size: 1.2rem; margin-bottom: 16px; }
      .specs-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        .spec-item {
          display: flex; align-items: center; gap: 14px; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 14px;
          .icon { font-size: 28px; color: var(--primary-accent); }
          strong { display: block; font-size: 0.92rem; color: var(--text-main); }
          small { color: var(--text-muted); font-size: 0.78rem; }
        }
      }
    }

    .driver-card {
      padding: 24px; h3 { font-size: 1.2rem; margin-bottom: 16px; }
      .driver-profile {
        display: flex; align-items: center; gap: 18px;
        .driver-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32px; }
        .driver-info {
          h4 { font-size: 1.2rem; margin-bottom: 4px; }
          .driver-tags { display: flex; gap: 8px; margin-bottom: 6px; .badge-tag { font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; background: rgba(245,158,11,0.15); color: #f59e0b; font-weight: 700; &.green { background: rgba(16,185,129,0.15); color: #10b981; } } }
          .phone { font-size: 0.85rem; color: var(--text-muted); }
        }
      }
    }

    .booking-sidebar {
      padding: 24px; height: fit-content; sticky: top 90px;
      .sidebar-price-header { margin-bottom: 20px; .price-amount { font-size: 2rem; font-weight: 800; color: #10b981; } .price-unit { color: var(--text-muted); font-size: 0.82rem; display: block; } }
      .route-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
      .input-field { display: flex; flex-direction: column; gap: 6px; label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); } input { padding: 10px; border-radius: 10px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); } }
      .fare-breakdown-box {
        padding: 16px; background: rgba(255,255,255,0.04); border-radius: 14px; margin-bottom: 20px; font-size: 0.88rem;
        .row { margin-bottom: 8px; color: var(--text-muted); }
        .divider { height: 1px; background: var(--border-glass); margin: 10px 0; }
        .total-row { font-size: 1.1rem; font-weight: 800; color: var(--text-main); .total-price { color: #10b981; } }
      }
      .full-width { width: 100%; padding: 14px; }
    }

    .icon-sm { font-size: 16px; vertical-align: middle; }
    .loading-state { padding: 60px; text-align: center; }
    .spinner { display: inline-block; width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: var(--primary-accent); animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CabDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  apiService = inject(ApiService);

  cabId = '';
  cab: CabService | null = null;
  loading = true;

  pickupLoc = 'Indira Gandhi International Airport (DEL)';
  dropLoc = 'The Grand Zenith Resort, Central Ring';
  distanceKm = 25;
  computedTotal = 700;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.cabId = params['id'];
      this.loadCabDetail();
    });
  }

  loadCabDetail() {
    this.loading = true;
    this.apiService.getCabs().subscribe(cabs => {
      const found = cabs.find(c => c.id === this.cabId) || cabs[0];
      this.cab = found;
      this.recalculateFare();
      this.loading = false;
    });
  }

  recalculateFare() {
    if (!this.cab) return;
    const gross = this.cab.baseFare + (this.distanceKm * this.cab.farePerKm);
    this.computedTotal = parseFloat(gross.toFixed(2));
  }

  proceedToCheckout() {
    if (!this.cab) return;
    this.router.navigate(['/checkout'], {
      queryParams: {
        type: 'cab',
        id: this.cab.id,
        name: this.cab.vehicleName,
        subtitle: `${this.pickupLoc} ➔ ${this.dropLoc} (${this.distanceKm} km)`,
        price: this.computedTotal
      }
    });
  }
}
