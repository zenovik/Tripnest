import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CabService } from '../../core/models/platform.models';

@Component({
  selector: 'app-cab-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="cabs-page container">
      
      <!-- Header -->
      <div class="page-title-area">
        <h1>Chauffeur & Executive Cab Services</h1>
        <p>Doorstep pickup, verified professional drivers, transparent per-KM fares.</p>
      </div>

      <div class="cabs-layout">
        
        <!-- Filter Sidebar -->
        <aside class="filters-sidebar glass-card">
          <div class="filter-header flex-between">
            <h3><span class="material-icons-outlined">tune</span> Filters</h3>
            <button class="btn-reset" (click)="resetFilters()">Reset</button>
          </div>

          <div class="filter-group">
            <label>Pickup City</label>
            <input type="text" [(ngModel)]="selectedCity" (input)="applyFilters()" placeholder="City..." />
          </div>

          <div class="filter-group">
            <label>Vehicle Category</label>
            <select [(ngModel)]="selectedType" (change)="applyFilters()">
              <option value="">All Categories</option>
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV (6+ Seats)</option>
              <option value="LUXURY">Luxury / Executive Class</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Amenities</label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="acOnly" (change)="applyFilters()" /> Air Conditioning (AC)
            </label>
          </div>
        </aside>

        <!-- Cab Cards Grid -->
        <main class="cabs-grid-container">
          
          <div *ngIf="cabs.length === 0" class="empty-state glass-card">
            <span class="material-icons-outlined">no_transfer</span>
            <h3>No Cabs Available in this Location</h3>
            <button class="btn-gradient" (click)="resetFilters()">Show All Cabs</button>
          </div>

          <div *ngFor="let cab of cabs" class="cab-card glass-card">
            
            <div class="card-image-wrap">
              <img [src]="cab.images[0]?.url || 'https://images.unsplash.com/photo-1563720223185-11003d516935'" [alt]="cab.vehicleName" />
              <span class="type-badge">{{ cab.cabType }}</span>
            </div>

            <div class="card-content">
              <div class="flex-between">
                <span class="city-name"><span class="material-icons-outlined">place</span> {{ cab.city.name }}</span>
                <span class="driver-rating">
                  <span class="material-icons-outlined">star</span> {{ cab.driverRating }}
                </span>
              </div>

              <h2 class="cab-name">{{ cab.vehicleName }}</h2>
              <span class="plate-number">{{ cab.vehicleNumber }}</span>

              <div class="driver-info-box">
                <div class="driver-avatar">
                  <span class="material-icons-outlined">person</span>
                </div>
                <div>
                  <strong>Driver: {{ cab.driverName }}</strong>
                  <span class="verified-tag"><span class="material-icons-outlined">verified</span> Verified Driver</span>
                </div>
              </div>

              <div class="specs-grid">
                <span><span class="material-icons-outlined">airline_seat_recline_normal</span> {{ cab.seatCapacity }} Seats</span>
                <span><span class="material-icons-outlined">ac_unit</span> {{ cab.hasAc ? 'AC Equipped' : 'Non-AC' }}</span>
              </div>

              <div class="card-footer flex-between">
                <div class="fare-info">
                  <span class="base-fare">Base ₹{{ cab.baseFare }}</span>
                  <span class="per-km">+ ₹{{ cab.farePerKm }}/km</span>
                </div>
                <div class="action-btns flex-gap">
                  <a [routerLink]="['/cabs', cab.id]" class="btn-secondary">
                    <span class="material-icons-outlined">info</span> View Specs
                  </a>
                  <button class="btn-gradient" (click)="openBookingModal(cab)">
                    <span class="material-icons-outlined">local_taxi</span> Book Cab
                  </button>
                </div>
              </div>
            </div>

          </div>

        </main>

      </div>

      <!-- Cab Booking Modal Dialog -->
      <div *ngIf="selectedCabModal" class="modal-overlay">
        <div class="modal-card glass-card">
          <div class="modal-header flex-between">
            <h2>Book {{ selectedCabModal.vehicleName }}</h2>
            <button class="btn-close" (click)="selectedCabModal = null">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="route-fields">
              <div class="input-field">
                <label>Pickup Location</label>
                <input type="text" [(ngModel)]="pickupLoc" placeholder="e.g. Indira Gandhi Airport (DEL)" />
              </div>
              <div class="input-field">
                <label>Drop Location</label>
                <input type="text" [(ngModel)]="dropLoc" placeholder="e.g. Connaught Place Hotel" />
              </div>
              <div class="input-field">
                <label>Estimated Distance (KM)</label>
                <input type="number" [(ngModel)]="distanceKm" (input)="recalculateFare()" />
              </div>
            </div>

            <!-- Fare Calculation Breakdown Box -->
            <div class="fare-breakdown-box">
              <div class="flex-between">
                <span>Base Fare:</span>
                <strong>₹{{ selectedCabModal.baseFare }}</strong>
              </div>
              <div class="flex-between">
                <span>Distance Charge ({{ distanceKm }} km x ₹{{ selectedCabModal.farePerKm }}):</span>
                <strong>₹{{ distanceKm * selectedCabModal.farePerKm }}</strong>
              </div>
              <div class="flex-between total-row">
                <span>Estimated Total:</span>
                <strong class="total-amount">₹{{ computedTotal }}</strong>
              </div>
            </div>

            <div class="modal-footer flex-between">
              <button class="btn-secondary" (click)="selectedCabModal = null">Cancel</button>
              <button class="btn-gradient" (click)="confirmBooking()">
                Confirm Cab Booking
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .cabs-page { padding: 40px 20px; }

    .page-title-area {
      margin-bottom: 30px;
      h1 { font-size: 2.5rem; }
      p { color: var(--text-muted); }
    }

    .cabs-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 30px;
    }

    .filters-sidebar {
      padding: 24px;
      height: fit-content;

      .filter-header { margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; }
      .btn-reset { background: transparent; border: none; color: var(--primary-accent); cursor: pointer; }

      .filter-group {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        input, select { background: var(--input-bg); border: 1px solid var(--input-border); padding: 10px; border-radius: 10px; color: var(--text-main); }
      }
    }

    .cabs-grid-container { display: flex; flex-direction: column; gap: 24px; }

    .cab-card {
      display: grid;
      grid-template-columns: 300px 1fr;
      overflow: hidden;

      .card-image-wrap {
        position: relative;
        height: 100%;
        img { width: 100%; height: 100%; object-fit: cover; }
        .type-badge { position: absolute; top: 12px; left: 12px; background: var(--primary-gradient); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
      }

      .card-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .city-name { font-size: 0.8rem; color: var(--primary-accent); font-weight: 600; }
        .driver-rating { color: var(--accent-gold); font-weight: 700; display: flex; align-items: center; gap: 4px; }
        .cab-name { font-size: 1.4rem; }
        .plate-number { font-size: 0.8rem; color: var(--text-subtle); background: var(--input-bg); padding: 2px 8px; border-radius: 4px; width: fit-content; }

        .driver-info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--input-bg);
          padding: 10px 14px;
          border-radius: 12px;
          margin: 10px 0;

          .driver-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; color: #fff; }
          .verified-tag { font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 2px; }
        }

        .specs-grid { display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-muted); span { display: flex; align-items: center; gap: 4px; } }
        .fare-info { .base-fare { font-size: 1.2rem; font-weight: 700; display: block; } .per-km { font-size: 0.8rem; color: var(--text-muted); } }
      }
    }

    .modal-card {
      width: 100%;
      max-width: 550px;
      padding: 30px;
      background: var(--modal-bg);
      border: 1px solid var(--border-glass);

      .route-fields { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
      .input-field input { background: var(--input-bg); border: 1px solid var(--input-border); padding: 10px; border-radius: 8px; color: var(--text-main); width: 100%; }

      .fare-breakdown-box {
        background: var(--input-bg);
        padding: 16px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 20px;

        .total-row { border-top: 1px solid var(--border-glass); padding-top: 10px; margin-top: 6px; }
        .total-amount { font-size: 1.4rem; color: var(--success); }
      }
    }

    @media (max-width: 992px) {
      .cabs-layout { grid-template-columns: 1fr; }
      .cab-card { grid-template-columns: 1fr; }
    }
  `]
})
export class CabListComponent implements OnInit {
  apiService = inject(ApiService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  cabs: CabService[] = [];
  selectedCity = '';
  selectedType = '';
  acOnly = false;

  // Booking Modal
  selectedCabModal: CabService | null = null;
  pickupLoc = 'JFK International Airport';
  dropLoc = 'The Grand Zenith Resort & Spa';
  distanceKm = 24.5;
  computedTotal = 0;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['city']) this.selectedCity = params['city'];
      if (params['cabType']) this.selectedType = params['cabType'];
      this.loadCabs();
    });
  }

  loadCabs() {
    this.apiService.getCabs(this.selectedType, this.selectedCity).subscribe(data => {
      this.cabs = data;
    });
  }

  applyFilters() {
    this.loadCabs();
  }

  resetFilters() {
    this.selectedCity = '';
    this.selectedType = '';
    this.acOnly = false;
    this.loadCabs();
  }

  openBookingModal(cab: CabService) {
    this.selectedCabModal = cab;
    this.recalculateFare();
  }

  recalculateFare() {
    if (!this.selectedCabModal) return;
    const gross = this.selectedCabModal.baseFare + (this.distanceKm * this.selectedCabModal.farePerKm);
    this.computedTotal = parseFloat(gross.toFixed(2));
  }

  confirmBooking() {
    if (!this.selectedCabModal) return;
    const cab = this.selectedCabModal;
    this.selectedCabModal = null;
    this.router.navigate(['/checkout'], {
      queryParams: {
        type: 'cab',
        name: cab.vehicleName,
        subtitle: `${this.pickupLoc} ➔ ${this.dropLoc} (${this.distanceKm} km)`,
        price: this.computedTotal
      }
    });
  }
}
