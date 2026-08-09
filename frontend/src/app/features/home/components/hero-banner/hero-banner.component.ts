import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="hero-container">
      
      <!-- Auto-Sliding Background Images -->
      <div class="slider-wrapper">
        <div 
          *ngFor="let bg of slides; let i = index" 
          class="slide" 
          [class.active]="currentSlide === i"
          [style.backgroundImage]="'url(' + bg + ')'"
        ></div>
        <div class="gradient-overlay"></div>
      </div>

      <!-- Hero Content Overlay -->
      <div class="container hero-content">
        <div class="hero-text-area">
          <span class="hero-pill">
            <span class="material-icons-outlined">auto_awesome</span> Premium Stays & Chauffeurs in India
          </span>
          <h1 class="hero-title">
            Discover Luxury Hotels & <br/>
            <span class="text-gradient">Executive Cab Services</span>
          </h1>
          <p class="hero-subtitle">
            Book handpicked 5-star resorts, oceanfront villas, and airport chauffeurs with transparent fares in Indian Rupees (₹).
          </p>

          <div class="hero-cta-group">
            <button class="btn-gradient" (click)="setActiveTab('hotels')">
              <span class="material-icons-outlined">hotel</span> Book Hotel
            </button>
            <button class="btn-secondary" (click)="setActiveTab('cabs')">
              <span class="material-icons-outlined">local_taxi</span> Book Cab
            </button>
          </div>
        </div>

        <!-- Integrated Search Glass Card -->
        <div class="search-box-card glass-card">
          <!-- Search Tabs Switcher -->
          <div class="search-tabs">
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'hotels'" 
              (click)="activeTab = 'hotels'"
            >
              <span class="material-icons-outlined">hotel</span> Stays & Hotels
            </button>
            <button 
              class="tab-btn" 
              [class.active]="activeTab === 'cabs'" 
              (click)="activeTab = 'cabs'"
            >
              <span class="material-icons-outlined">directions_car</span> Cab Rides
            </button>
          </div>

          <!-- Hotel Search Tab Form -->
          <div *ngIf="activeTab === 'hotels'" class="search-form-grid">
            <div class="input-field location-input-container">
              <label><span class="material-icons-outlined">place</span> Destination / City (Google Places)</label>
              <input 
                type="text" 
                [(ngModel)]="searchCity" 
                (input)="onCityInput()"
                placeholder="Where are you going? (e.g. New Delhi, Mumbai)" 
              />
              <div *ngIf="showLocationSuggestions && locationSuggestions.length > 0" class="location-suggestions-dropdown">
                <div *ngFor="let loc of locationSuggestions" class="suggestion-item" (click)="selectCity(loc)">
                  <span class="material-icons-outlined">location_on</span>
                  <div>
                    <strong>{{ loc.mainText }}</strong>
                    <small>{{ loc.secondaryText }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="input-field">
              <label><span class="material-icons-outlined">calendar_today</span> Check In</label>
              <input type="date" [(ngModel)]="checkInDate" />
            </div>
            <div class="input-field">
              <label><span class="material-icons-outlined">event</span> Check Out</label>
              <input type="date" [(ngModel)]="checkOutDate" />
            </div>
            <div class="input-field">
              <label><span class="material-icons-outlined">group</span> Guests & Rooms</label>
              <select [(ngModel)]="guestsCount">
                <option value="1">1 Guest, 1 Room</option>
                <option value="2">2 Guests, 1 Room</option>
                <option value="4">4 Guests, 2 Rooms</option>
              </select>
            </div>
            <div class="search-btn-wrapper">
              <button class="btn-gradient full-width" (click)="onSearchHotels()">
                <span class="material-icons-outlined">search</span> Search Stays
              </button>
            </div>
          </div>

          <!-- Cab Search Tab Form -->
          <div *ngIf="activeTab === 'cabs'" class="search-form-grid">
            <div class="input-field">
              <label><span class="material-icons-outlined">my_location</span> Pickup Location</label>
              <input type="text" [(ngModel)]="pickupLoc" placeholder="Indira Gandhi Airport (DEL) / City" />
            </div>
            <div class="input-field">
              <label><span class="material-icons-outlined">pin_drop</span> Drop Off Location</label>
              <input type="text" [(ngModel)]="dropLoc" placeholder="Hotel or Destination Address" />
            </div>
            <div class="input-field">
              <label><span class="material-icons-outlined">schedule</span> Date & Time</label>
              <input type="datetime-local" [(ngModel)]="pickupTime" />
            </div>
            <div class="input-field">
              <label><span class="material-icons-outlined">time_to_leave</span> Vehicle Type</label>
              <select [(ngModel)]="cabType">
                <option value="">All Vehicles</option>
                <option value="SEDAN">Executive Sedan</option>
                <option value="SUV">Luxury SUV</option>
                <option value="LUXURY">Mercedes / VIP Class</option>
              </select>
            </div>
            <div class="search-btn-wrapper">
              <button class="btn-gradient full-width" (click)="onSearchCabs()">
                <span class="material-icons-outlined">directions_car</span> Find Cabs
              </button>
            </div>
          </div>
        </div>

      </div>

    </section>
  `,
  styles: [`
    .hero-container {
      position: relative;
      min-height: calc(100vh - 74px);
      display: flex;
      align-items: center;
      padding: 60px 0;
      overflow: hidden;
    }

    .slider-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;

      .slide {
        position: absolute;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        opacity: 0;
        transition: opacity 1.2s ease-in-out, transform 8s ease;

        &.active {
          opacity: 1;
          transform: scale(1.05);
        }
      }

      .gradient-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background: var(--hero-overlay);
      }
    }

    .hero-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .hero-text-area {
      max-width: 800px;

      .hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: var(--primary-accent);
        padding: 6px 16px;
        border-radius: 30px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .hero-title {
        font-size: 3.5rem;
        line-height: 1.15;
        margin-bottom: 20px;
        color: var(--hero-title-color);
      }

      .hero-subtitle {
        font-size: 1.2rem;
        color: var(--text-muted);
        margin-bottom: 30px;
        line-height: 1.6;
      }

      .hero-cta-group {
        display: flex;
        gap: 16px;
      }
    }

    .search-box-card {
      padding: 24px;
      border-radius: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-glass);

      .search-tabs {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--border-glass);
        padding-bottom: 12px;

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-primary);
          font-weight: 600;
          font-size: 1rem;
          padding: 8px 16px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;

          &:hover {
            color: var(--text-main);
            background: var(--btn-sec-bg);
          }

          &.active {
            color: #ffffff;
            background: var(--primary-gradient);
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          }
        }
      }

      .search-form-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr) auto;
        gap: 16px;
        align-items: flex-end;

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 8px;

          label {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 4px;
          }

          input, select {
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            border-radius: 12px;
            padding: 12px 14px;
            color: var(--text-main);
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s ease;

            &:focus {
              border-color: var(--primary-accent);
            }
          }
        }

        .location-input-container {
          position: relative;

          .location-suggestions-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            margin-top: 6px;
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            z-index: 100;
            overflow: hidden;

            .suggestion-item {
              padding: 10px 14px;
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              transition: background 0.2s ease;

              &:hover { background: var(--input-bg); }

              strong { font-size: 0.88rem; display: block; color: var(--text-main); }
              small { font-size: 0.75rem; color: var(--text-muted); }
            }
          }
        }

        .full-width {
          width: 100%;
          height: 46px;
          justify-content: center;
        }
      }
    }

    @media (max-width: 992px) {
      .hero-title { font-size: 2.4rem; }
      .search-form-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 600px) {
      .search-form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  router = inject(Router);
  apiService = inject(ApiService);

  slides = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80'
  ];

  currentSlide = 0;
  slideTimer: any;
  activeTab: 'hotels' | 'cabs' = 'hotels';

  // Form Models
  searchCity = '';
  checkInDate = '';
  checkOutDate = '';
  guestsCount = '2';

  pickupLoc = '';
  dropLoc = '';
  pickupTime = '';
  cabType = '';

  locationSuggestions: any[] = [];
  showLocationSuggestions = false;

  ngOnInit() {
    this.slideTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  ngOnDestroy() {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  onCityInput() {
    if (this.searchCity.trim().length > 0) {
      this.apiService.getLocationsAutocomplete(this.searchCity).subscribe(res => {
        this.locationSuggestions = res;
        this.showLocationSuggestions = true;
      });
    } else {
      this.showLocationSuggestions = false;
    }
  }

  selectCity(loc: any) {
    this.searchCity = loc.mainText;
    this.showLocationSuggestions = false;
  }

  setActiveTab(tab: 'hotels' | 'cabs') {
    this.activeTab = tab;
  }

  onSearchHotels() {
    this.router.navigate(['/hotels'], { queryParams: { city: this.searchCity } });
  }

  onSearchCabs() {
    this.router.navigate(['/cabs'], { queryParams: { city: this.pickupLoc, cabType: this.cabType } });
  }
}
