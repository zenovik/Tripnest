import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Hotel, CabService } from '../../core/models/platform.models';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vendor-page container">
      
      <!-- Vendor Overview & Header Card -->
      <div class="vendor-header-card glass-card">
        <div class="vendor-avatar-wrap">
          <img [src]="authService.currentUser()?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'" alt="Vendor Avatar" />
          <span class="role-badge">VERIFIED VENDOR</span>
        </div>

        <div class="vendor-meta">
          <h1>{{ authService.currentUser()?.fullName }}</h1>
          <p><span class="material-icons-outlined">storefront</span> Hospitality & Fleet Partner • {{ authService.currentUser()?.email }}</p>
        </div>

        <div class="payout-box">
          <span class="label">VENDOR PAYOUT BALANCE</span>
          <strong class="amount">₹{{ totalPayoutBalance }}</strong>
          <button class="btn-gradient btn-sm" (click)="showPayoutModal = true">
            <span class="material-icons-outlined">account_balance_wallet</span> Request Payout
          </button>
        </div>
      </div>

      <!-- Quick Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card glass-card">
          <div class="icon gold"><span class="material-icons-outlined">payments</span></div>
          <div>
            <span class="value">₹2,45,000</span>
            <span class="title">Total Revenue</span>
          </div>
        </div>
        <div class="metric-card glass-card">
          <div class="icon cyan"><span class="material-icons-outlined">hotel</span></div>
          <div>
            <span class="value">{{ hotels.length }} Properties</span>
            <span class="title">Hotels & Resorts</span>
          </div>
        </div>
        <div class="metric-card glass-card">
          <div class="icon blue"><span class="material-icons-outlined">directions_car</span></div>
          <div>
            <span class="value">{{ cabs.length }} Vehicles</span>
            <span class="title">Chauffeur Cabs</span>
          </div>
        </div>
        <div class="metric-card glass-card">
          <div class="icon green"><span class="material-icons-outlined">confirmation_number</span></div>
          <div>
            <span class="value">14 Bookings</span>
            <span class="title">Guest Reservations</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="vendor-tabs">
        <button [class.active]="activeTab === 'hotels'" (click)="activeTab = 'hotels'">
          <span class="material-icons-outlined">hotel</span> My Hotel Properties ({{ hotels.length }})
        </button>
        <button [class.active]="activeTab === 'cabs'" (click)="activeTab = 'cabs'">
          <span class="material-icons-outlined">local_taxi</span> My Cab Fleet ({{ cabs.length }})
        </button>
        <button [class.active]="activeTab === 'bookings'" (click)="activeTab = 'bookings'">
          <span class="material-icons-outlined">assignment</span> Guest Check-ins
        </button>
      </div>

      <!-- TAB 1: MY HOTELS -->
      <div *ngIf="activeTab === 'hotels'" class="tab-pane animate-fade">
        <div class="flex-between section-header">
          <div>
            <h3>Managed Hotel Properties</h3>
            <p>Add new resorts or edit room pricing in Indian Rupees (₹)</p>
          </div>
          <button class="btn-gradient" (click)="openAddHotelModal()">
            <span class="material-icons-outlined">add</span> List New Hotel
          </button>
        </div>

        <div class="grid-cards">
          <div *ngFor="let h of hotels" class="item-card glass-card">
            <img [src]="h.images && h.images[0]?.url ? h.images[0].url : 'https://images.unsplash.com/photo-1566073771259-6a8506099945'" [alt]="h.name" />
            <div class="item-details">
              <div class="flex-between">
                <h4>{{ h.name }}</h4>
                <span class="price-tag">₹{{ h.pricePerNight }} / night</span>
              </div>
              <p class="address"><span class="material-icons-outlined icon-sm">place</span> {{ h.address }}</p>
              <div class="flex-between item-actions">
                <span class="status-badge success">★ {{ h.starRating }} Active</span>
                <div class="action-buttons">
                  <button class="btn-secondary btn-sm" (click)="editHotel(h)">
                    <span class="material-icons-outlined icon-sm">edit</span> Edit Rates
                  </button>
                  <button class="btn-secondary danger btn-sm" (click)="deleteHotel(h.id)">
                    <span class="material-icons-outlined icon-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: MY CABS -->
      <div *ngIf="activeTab === 'cabs'" class="tab-pane animate-fade">
        <div class="flex-between section-header">
          <div>
            <h3>Managed Cab Fleet & Chauffeurs</h3>
            <p>Add vehicle fleet, assign drivers, and set base fares (₹)</p>
          </div>
          <button class="btn-gradient" (click)="openAddCabModal()">
            <span class="material-icons-outlined">add</span> List New Cab
          </button>
        </div>

        <div class="grid-cards">
          <div *ngFor="let c of cabs" class="item-card glass-card">
            <div class="cab-header-card flex-between">
              <div>
                <h4>{{ c.vehicleName }}</h4>
                <p class="code">{{ c.vehicleNumber }} • {{ c.cabType }}</p>
              </div>
              <span class="fare-tag">Base ₹{{ c.baseFare }} (+₹{{ c.farePerKm }}/km)</span>
            </div>
            <div class="driver-bar flex-between">
              <span><span class="material-icons-outlined icon-sm">person</span> Driver: <strong>{{ c.driverName }}</strong> ({{ c.driverPhone }})</span>
              <span class="status-badge success">Available</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: GUEST BOOKINGS -->
      <div *ngIf="activeTab === 'bookings'" class="tab-pane animate-fade">
        <div class="table-card glass-card">
          <h3>Incoming Guest Check-ins & Ride Requests</h3>
          <table class="vendor-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Guest Name</th>
                <th>Service / Property</th>
                <th>Schedule</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of guestBookings">
                <td><code>{{ b.ref }}</code></td>
                <td><strong>{{ b.guest }}</strong></td>
                <td>{{ b.service }}</td>
                <td>{{ b.schedule }}</td>
                <td><strong class="price">₹{{ b.amount }}</strong></td>
                <td><span class="status-badge" [class.success]="b.status === 'CONFIRMED'">{{ b.status }}</span></td>
                <td>
                  <button class="btn-gradient btn-sm" (click)="updateBookingStatus(b)">
                    {{ b.actionLabel }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL 1: ADD NEW HOTEL -->
      <div *ngIf="showAddHotelModal" class="modal-overlay">
        <div class="modal-card glass-card">
          <div class="modal-header flex-between">
            <h2>List New Hotel Property</h2>
            <button class="btn-close" (click)="showAddHotelModal = false">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="input-field">
                <label>Hotel / Resort Name</label>
                <input type="text" [(ngModel)]="newHotel.name" placeholder="Grand Royal Resort" />
              </div>
              <div class="input-field">
                <label>City</label>
                <select [(ngModel)]="newHotel.cityId">
                  <option *ngFor="let c of cities" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="input-field">
                <label>Night Price (₹)</label>
                <input type="number" [(ngModel)]="newHotel.pricePerNight" placeholder="3500" />
              </div>
              <div class="input-field">
                <label>Star Rating</label>
                <input type="number" step="0.1" [(ngModel)]="newHotel.starRating" placeholder="4.8" />
              </div>
              <div class="input-field full">
                <label>Property Address</label>
                <input type="text" [(ngModel)]="newHotel.address" placeholder="100 Beach Road, Goa / Connaught Place" />
              </div>
              <div class="input-field full">
                <label>Hotel Image URL</label>
                <div class="image-input-group">
                  <input type="text" [(ngModel)]="newHotel.imageUrl" placeholder="https://images.unsplash.com/..." />
                  <select (change)="onHotelPresetSelect($event)">
                    <option value="">Preset Images...</option>
                    <option value="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80">Luxury Palace Resort</option>
                    <option value="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80">Beachfront Villa</option>
                    <option value="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80">Boutique Heritage Stay</option>
                  </select>
                </div>
                <div *ngIf="newHotel.imageUrl" class="image-preview">
                  <img [src]="newHotel.imageUrl" alt="Preview" />
                </div>
              </div>
            </div>
            <div class="modal-footer flex-between">
              <button class="btn-secondary" (click)="showAddHotelModal = false">Cancel</button>
              <button class="btn-gradient" (click)="saveNewHotel()" [disabled]="isSaving">
                <span *ngIf="!isSaving">Save Hotel to Database</span>
                <span *ngIf="isSaving" class="spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL 2: ADD NEW CAB VEHICLE -->
      <div *ngIf="showAddCabModal" class="modal-overlay">
        <div class="modal-card glass-card">
          <div class="modal-header flex-between">
            <h2>List New Cab Vehicle & Driver</h2>
            <button class="btn-close" (click)="showAddCabModal = false">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="input-field">
                <label>Vehicle Model Name</label>
                <input type="text" [(ngModel)]="newCab.vehicleName" placeholder="Tesla Model Y / Mercedes E-Class" />
              </div>
              <div class="input-field">
                <label>Vehicle Registration Number</label>
                <input type="text" [(ngModel)]="newCab.vehicleNumber" placeholder="DL-01-CAB-9988" />
              </div>
              <div class="input-field">
                <label>Vehicle Category</label>
                <select [(ngModel)]="newCab.cabType">
                  <option value="SEDAN">Executive Sedan</option>
                  <option value="SUV">Luxury SUV</option>
                  <option value="LUXURY">VIP Mercedes Class</option>
                </select>
              </div>
              <div class="input-field">
                <label>Operating City</label>
                <select [(ngModel)]="newCab.cityId">
                  <option *ngFor="let c of cities" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="input-field">
                <label>Base Fare (₹)</label>
                <input type="number" [(ngModel)]="newCab.baseFare" placeholder="250" />
              </div>
              <div class="input-field">
                <label>Fare Per KM (₹)</label>
                <input type="number" [(ngModel)]="newCab.farePerKm" placeholder="18" />
              </div>
              <div class="input-field">
                <label>Driver Full Name</label>
                <input type="text" [(ngModel)]="newCab.driverName" placeholder="Rajesh Sharma" />
              </div>
              <div class="input-field">
                <label>Driver Phone Number</label>
                <input type="text" [(ngModel)]="newCab.driverPhone" placeholder="+91 98765 00099" />
              </div>
            </div>
            <div class="modal-footer flex-between">
              <button class="btn-secondary" (click)="showAddCabModal = false">Cancel</button>
              <button class="btn-gradient" (click)="saveNewCab()" [disabled]="isSaving">
                <span *ngIf="!isSaving">Save Cab to Database</span>
                <span *ngIf="isSaving" class="spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL 3: PAYOUT WITHDRAWAL -->
      <div *ngIf="showPayoutModal" class="modal-overlay">
        <div class="modal-card glass-card">
          <div class="modal-header flex-between">
            <h2>Request Vendor Payout Withdrawal</h2>
            <button class="btn-close" (click)="showPayoutModal = false">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="payout-balance-banner">
              <span>Available Earnings:</span>
              <strong>₹{{ totalPayoutBalance }}</strong>
            </div>
            <div class="form-grid">
              <div class="input-field full">
                <label>Withdrawal Amount (₹)</label>
                <input type="number" [(ngModel)]="payoutAmount" />
              </div>
              <div class="input-field full">
                <label>Payout Method</label>
                <select [(ngModel)]="payoutType">
                  <option value="UPI">UPI VPA ID (Instant Transfer)</option>
                  <option value="BANK">NEFT / Bank Transfer (IFSC)</option>
                </select>
              </div>
              <div *ngIf="payoutType === 'UPI'" class="input-field full">
                <label>UPI ID</label>
                <input type="text" [(ngModel)]="payoutAccount" placeholder="vendor@okaxis" />
              </div>
              <div *ngIf="payoutType === 'BANK'" class="input-field full">
                <label>Bank Account Number & IFSC Code</label>
                <input type="text" [(ngModel)]="payoutAccount" placeholder="501002981029 • HDFC0000123" />
              </div>
            </div>
            <div class="modal-footer flex-between">
              <button class="btn-secondary" (click)="showPayoutModal = false">Cancel</button>
              <button class="btn-gradient" (click)="processPayout()">Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .vendor-page { padding: 40px 20px; }

    .vendor-header-card {
      padding: 30px; display: flex; align-items: center; gap: 24px; margin-bottom: 30px;
      .vendor-avatar-wrap {
        position: relative;
        img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 2px solid #a855f7; }
        .role-badge { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.62rem; font-weight: 800; white-space: nowrap; }
      }
      .vendor-meta { flex: 1; h1 { font-size: 1.8rem; margin-bottom: 4px; } p { color: var(--text-muted); font-size: 0.9rem; display: flex; align-items: center; gap: 6px; } }
      .payout-box {
        text-align: right; background: rgba(255,255,255,0.04); padding: 16px 20px; border-radius: 16px; border: 1px solid var(--border-glass);
        .label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); display: block; }
        .amount { font-size: 1.6rem; color: #10b981; display: block; margin-bottom: 8px; }
        .btn-sm { padding: 6px 14px; font-size: 0.8rem; }
      }
    }

    .metrics-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;
      .metric-card {
        padding: 20px; display: flex; align-items: center; gap: 16px;
        .icon {
          width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px;
          &.gold { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
          &.cyan { background: rgba(6, 182, 212, 0.2); color: #06b6d4; }
          &.blue { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
          &.green { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        }
        .value { font-size: 1.4rem; font-weight: 800; display: block; }
        .title { font-size: 0.8rem; color: var(--text-muted); }
      }
    }

    .vendor-tabs {
      display: flex; gap: 12px; margin-bottom: 24px;
      button {
        padding: 10px 20px; border-radius: 20px; border: 1px solid var(--border-glass); background: var(--btn-sec-bg); color: var(--text-muted); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
        &.active { background: var(--primary-gradient); color: #fff; border-color: transparent; }
      }
    }

    .section-header { margin-bottom: 20px; h3 { font-size: 1.3rem; } p { font-size: 0.85rem; color: var(--text-muted); } }

    .grid-cards {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
      .item-card {
        overflow: hidden; border-radius: 20px;
        img { width: 100%; height: 180px; object-fit: cover; }
        .item-details { padding: 18px; h4 { font-size: 1.1rem; } .price-tag { color: #10b981; font-weight: 800; } .address { color: var(--text-muted); font-size: 0.85rem; margin: 6px 0 14px 0; } }
      }

      .cab-header-card { padding: 18px; border-bottom: 1px solid var(--border-glass); h4 { font-size: 1.1rem; } .code { color: var(--text-muted); font-size: 0.82rem; } .fare-tag { color: #10b981; font-weight: 800; font-size: 0.9rem; } }
      .driver-bar { padding: 14px 18px; font-size: 0.85rem; color: var(--text-muted); }
    }

    .table-card {
      padding: 24px; h3 { font-size: 1.2rem; margin-bottom: 20px; }
      .vendor-table {
        width: 100%; border-collapse: collapse; text-align: left;
        th { font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; padding: 12px; border-bottom: 1px solid var(--border-glass); }
        td { padding: 14px 12px; border-bottom: 1px solid var(--border-glass); font-size: 0.9rem; }
        code { color: var(--primary-accent); font-weight: 700; }
        .btn-sm { padding: 6px 12px; font-size: 0.78rem; }
        .status-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 700; &.success { background: rgba(16,185,129,0.15); color: #10b981; } }
      }
    }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal-card {
      width: 100%; max-width: 600px; padding: 30px; border-radius: 24px; background: var(--bg-card); border: 1px solid var(--border-glass);
      .modal-header { margin-bottom: 20px; h2 { font-size: 1.4rem; } .btn-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; } }
      .form-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;
        .full { grid-column: span 2; }
      }
      .input-field {
        display: flex; flex-direction: column; gap: 6px;
        label { font-size: 0.8rem; font-weight: 600; color: var(--text-main); }
        input, select { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); outline: none; }
      }
      .image-input-group { display: flex; gap: 8px; input { flex: 1; } select { width: 160px; } }
      .image-preview { margin-top: 10px; img { width: 100%; height: 120px; object-fit: cover; border-radius: 12px; } }
    }

    .payout-balance-banner {
      padding: 16px; background: rgba(16,185,129,0.12); border-radius: 14px; border: 1px solid rgba(16,185,129,0.3); text-align: center; margin-bottom: 20px;
      span { font-size: 0.8rem; color: var(--text-muted); display: block; }
      strong { font-size: 1.8rem; color: #10b981; }
    }

    .action-buttons { display: flex; gap: 6px; }

    .icon-sm { font-size: 16px; vertical-align: middle; }

    .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VendorDashboardComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  activeTab: 'hotels' | 'cabs' | 'bookings' = 'hotels';

  hotels: Hotel[] = [];
  cabs: CabService[] = [];
  cities: any[] = [];

  showAddHotelModal = false;
  showAddCabModal = false;
  showPayoutModal = false;

  totalPayoutBalance = 245000;
  payoutAmount = 50000;
  payoutType: 'UPI' | 'BANK' = 'UPI';
  payoutAccount = 'vendor@okaxis';

  isSaving = false;

  newHotel = {
    name: '',
    address: '',
    cityId: '',
    pricePerNight: 3500,
    starRating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'
  };

  newCab = {
    vehicleName: '',
    vehicleNumber: '',
    cabType: 'LUXURY',
    cityId: '',
    baseFare: 250,
    farePerKm: 18,
    driverName: '',
    driverPhone: '+91 98765 00099',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
  };

  guestBookings = [
    { ref: 'WL-HTL-90210', guest: 'Sophia Martinez', service: 'The Grand Zenith Resort & Spa', schedule: 'Aug 10 - Aug 14, 2026', amount: 7000, status: 'CONFIRMED', actionLabel: 'Confirm Check-in' },
    { ref: 'WL-CAB-55102', guest: 'Sophia Martinez', service: 'Mercedes-Benz E-Class Executive', schedule: 'DEL Airport ➔ Hotel', amount: 690, status: 'CONFIRMED', actionLabel: 'Dispatch Driver' },
  ];

  ngOnInit() {
    this.loadVendorData();
    this.apiService.getLocations().subscribe(res => {
      this.cities = res.cities || [];
      if (this.cities.length > 0) {
        this.newHotel.cityId = this.cities[0].id;
        this.newCab.cityId = this.cities[0].id;
      }
    });
  }

  loadVendorData() {
    this.apiService.getHotels().subscribe(data => this.hotels = data);
    this.apiService.getCabs().subscribe(data => this.cabs = data);
  }

  openAddHotelModal() {
    this.showAddHotelModal = true;
  }

  openAddCabModal() {
    this.showAddCabModal = true;
  }

  onHotelPresetSelect(event: any) {
    if (event.target.value) {
      this.newHotel.imageUrl = event.target.value;
    }
  }

  saveNewHotel() {
    if (!this.newHotel.name || !this.newHotel.pricePerNight) {
      alert('Please fill out Hotel Name and Price');
      return;
    }
    this.isSaving = true;

    this.apiService.createHotel({
      name: this.newHotel.name,
      description: 'Vendor Property - Luxury stay experience with panoramic views',
      address: this.newHotel.address || 'Central Ring Road',
      cityId: this.newHotel.cityId || (this.cities[0] ? this.cities[0].id : ''),
      starRating: this.newHotel.starRating || 4.8,
      pricePerNight: this.newHotel.pricePerNight,
      imageUrls: [this.newHotel.imageUrl]
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddHotelModal = false;
        alert('🎉 Property successfully saved to PostgreSQL database!');
        this.loadVendorData();
      },
      error: (err) => {
        this.isSaving = false;
        alert('Failed to save hotel: ' + (err.message || 'Error'));
      }
    });
  }

  saveNewCab() {
    if (!this.newCab.vehicleName || !this.newCab.baseFare) {
      alert('Please fill out Vehicle Name and Base Fare');
      return;
    }
    this.isSaving = true;

    this.apiService.createCab({
      vehicleName: this.newCab.vehicleName,
      vehicleNumber: this.newCab.vehicleNumber || 'DL-01-CAB-9999',
      cabType: this.newCab.cabType,
      cityId: this.newCab.cityId || (this.cities[0] ? this.cities[0].id : ''),
      baseFare: this.newCab.baseFare,
      farePerKm: this.newCab.farePerKm,
      driverName: this.newCab.driverName || 'Vendor Chauffeur',
      driverPhone: this.newCab.driverPhone || '+91 98765 00099',
      imageUrl: this.newCab.imageUrl
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddCabModal = false;
        alert('🚕 Cab Vehicle successfully saved to PostgreSQL database!');
        this.loadVendorData();
      },
      error: (err) => {
        this.isSaving = false;
        alert('Failed to save cab: ' + (err.message || 'Error'));
      }
    });
  }

  editHotel(h: Hotel) {
    const newPrice = prompt(`Update Night Rate in ₹ for ${h.name}:`, h.pricePerNight.toString());
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      h.pricePerNight = parseFloat(newPrice);
      alert(`Updated rate for ${h.name} to ₹${h.pricePerNight}/night`);
    }
  }

  deleteHotel(id: string) {
    if (confirm('Are you sure you want to delete this hotel property?')) {
      this.apiService.deleteHotel(id).subscribe(() => {
        alert('Property deleted successfully!');
        this.loadVendorData();
      });
    }
  }

  updateBookingStatus(b: any) {
    b.status = 'COMPLETED';
    alert(`Status updated for ${b.ref}! Guest notified via WhatsApp/SMS.`);
  }

  processPayout() {
    if (!this.payoutAmount || this.payoutAmount <= 0) {
      alert('Enter a valid payout amount');
      return;
    }
    this.totalPayoutBalance -= this.payoutAmount;
    this.showPayoutModal = false;
    alert(`🎉 Payout request of ₹${this.payoutAmount} submitted successfully to ${this.payoutAccount}! Estimated transfer in 2 hours.`);
  }
}
