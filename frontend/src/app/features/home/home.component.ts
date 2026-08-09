import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { ApiService } from '../../core/services/api.service';
import { Hotel, CabService } from '../../core/models/platform.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroBannerComponent],
  template: `
    <div class="home-page">
      
      <!-- 1. Hero Banner Slider with Search -->
      <app-hero-banner></app-hero-banner>

      <!-- 2. Popular Destinations Bar -->
      <section class="section container">
        <div class="section-title flex-between">
          <div>
            <h2>Popular Travel Destinations</h2>
            <p>Handpicked cities with luxury stays and top chauffeur networks.</p>
          </div>
        </div>

        <div class="destinations-grid">
          <div class="dest-card glass-card" (click)="filterCity('New York City')">
            <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80" alt="NYC" />
            <div class="dest-info">
              <h3>New York City</h3>
              <span>24 Stays • 15 Cabs</span>
            </div>
          </div>

          <div class="dest-card glass-card" (click)="filterCity('Los Angeles')">
            <img src="https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=600&q=80" alt="LA" />
            <div class="dest-info">
              <h3>Los Angeles</h3>
              <span>18 Stays • 12 Cabs</span>
            </div>
          </div>

          <div class="dest-card glass-card" (click)="filterCity('Santa Monica')">
            <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80" alt="Miami" />
            <div class="dest-info">
              <h3>Santa Monica Beach</h3>
              <span>12 Stays • 8 Cabs</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Featured Luxury Hotels Carousel/Grid -->
      <section class="section container">
        <div class="section-title flex-between">
          <div>
            <h2>Featured Stays & Hotels</h2>
            <p>Experience world-class hospitality and luxury amenities.</p>
          </div>
          <a routerLink="/hotels" class="btn-secondary">View All Hotels &rarr;</a>
        </div>

        <div class="hotels-mini-grid">
          <div *ngFor="let h of featuredHotels" class="hotel-mini-card glass-card">
            <img [src]="h.images[0]?.url" [alt]="h.name" />
            <div class="card-body">
              <span class="city-tag"><span class="material-icons-outlined">place</span> {{ h.city.name }}</span>
              <h4>{{ h.name }}</h4>
              <div class="flex-between price-row">
                <span class="rating-star">★ {{ h.starRating }}</span>
                <strong class="price">\${{ h.pricePerNight }}<small>/night</small></strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Executive Cab Booking Highlight -->
      <section class="section container">
        <div class="cab-highlight-card glass-card">
          <div class="highlight-content">
            <span class="badge-gold">Seamless Chauffeur Service</span>
            <h2>Travel in Comfort & Style</h2>
            <p>From luxury airport transfers to outstation rides, our fleet of verified drivers guarantees zero wait time, transparent fares, and 100% comfort.</p>
            <div class="highlight-stats flex-between">
              <div>
                <strong>4.9 ★</strong>
                <span>Average Driver Rating</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Sanitized & AC Equipped</span>
              </div>
            </div>
            <a routerLink="/cabs" class="btn-gradient">Book Your Cab Ride &rarr;</a>
          </div>
          <div class="highlight-image">
            <img src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80" alt="Executive Cab" />
          </div>
        </div>
      </section>

      <!-- 5. Modular Ecosystem Expansion Showcase -->
      <section class="section container">
        <div class="section-title text-center">
          <h2>Modular Travel Ecosystem</h2>
          <p>Built with extensible architecture to power your complete journey.</p>
        </div>

        <div class="modules-grid">
          <div class="module-card glass-card active">
            <span class="material-icons-outlined">hotel</span>
            <h3>Hotels & Stays</h3>
            <span class="status-pill active">Active</span>
          </div>

          <div class="module-card glass-card active">
            <span class="material-icons-outlined">local_taxi</span>
            <h3>Cab Booking</h3>
            <span class="status-pill active">Active</span>
          </div>

          <div class="module-card glass-card">
            <span class="material-icons-outlined">tour</span>
            <h3>Tour Packages</h3>
            <span class="status-pill upcoming">Coming Soon</span>
          </div>

          <div class="module-card glass-card">
            <span class="material-icons-outlined">event</span>
            <h3>Event Booking</h3>
            <span class="status-pill upcoming">Coming Soon</span>
          </div>

          <div class="module-card glass-card">
            <span class="material-icons-outlined">temple_hindu</span>
            <h3>Temple Booking</h3>
            <span class="status-pill upcoming">Coming Soon</span>
          </div>

          <div class="module-card glass-card">
            <span class="material-icons-outlined">self_improvement</span>
            <h3>Purohit Services</h3>
            <span class="status-pill upcoming">Coming Soon</span>
          </div>

          <div class="module-card glass-card">
            <span class="material-icons-outlined">electric_rickshaw</span>
            <h3>E-Rickshaw</h3>
            <span class="status-pill upcoming">Coming Soon</span>
          </div>

          <div class="module-card glass-card">
            <span class="material-icons-outlined">local_shipping</span>
            <h3>Parcel Delivery</h3>
            <span class="status-pill upcoming">Coming Soon</span>
          </div>
        </div>
      </section>

      <!-- 6. Footer -->
      <footer class="footer">
        <div class="container footer-content flex-between">
          <div>
            <h3 class="brand-name">Wanderlust Platform</h3>
            <p>&copy; 2026 Wanderlust Travel Inc. All rights reserved.</p>
          </div>
          <div class="footer-links">
            <a routerLink="/hotels">Hotels</a>
            <a routerLink="/cabs">Cabs</a>
            <a routerLink="/about">About</a>
            <a routerLink="/contact">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    .section { margin: 60px auto; }
    .text-center { text-align: center; }

    .section-title {
      margin-bottom: 24px;
      h2 { font-size: 2rem; }
      p { color: var(--text-muted); }
    }

    .destinations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .dest-card {
      position: relative;
      height: 220px;
      overflow: hidden;
      border-radius: 20px;
      cursor: pointer;

      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
      &:hover img { transform: scale(1.08); }

      .dest-info {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 20px;
        background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%);

        h3 { color: #fff; font-size: 1.3rem; }
        span { font-size: 0.8rem; color: var(--text-muted); }
      }
    }

    .hotels-mini-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .hotel-mini-card {
      overflow: hidden;
      border-radius: 16px;

      img { width: 100%; height: 180px; object-fit: cover; }
      .card-body {
        padding: 16px;
        .city-tag { font-size: 0.75rem; color: var(--primary-accent); font-weight: 600; }
        h4 { font-size: 1.1rem; margin: 4px 0 12px 0; }
        .price { font-size: 1.2rem; color: var(--text-main); small { font-size: 0.75rem; color: var(--text-muted); } }
      }
    }

    .cab-highlight-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 40px;
      border-radius: 28px;
      gap: 30px;
      align-items: center;

      .highlight-content {
        h2 { font-size: 2.2rem; margin: 12px 0; }
        p { color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; }
      }

      .highlight-stats { margin-bottom: 24px; strong { font-size: 1.5rem; color: var(--primary-accent); display: block; } span { font-size: 0.8rem; color: var(--text-muted); } }

      .highlight-image { img { width: 100%; border-radius: 20px; object-fit: cover; } }
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 30px;
    }

    .module-card {
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      span.material-icons-outlined { font-size: 2.5rem; color: var(--primary-accent); }
      h3 { font-size: 1rem; }

      .status-pill {
        font-size: 0.7rem;
        padding: 3px 10px;
        border-radius: 20px;
        font-weight: 600;
        &.active { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        &.upcoming { background: rgba(255, 255, 255, 0.08); color: var(--text-muted); }
      }
    }

    .footer {
      border-top: 1px solid var(--border-glass);
      padding: 40px 0;
      margin-top: 80px;

      .footer-links { display: flex; gap: 20px; color: var(--text-muted); }
    }

    @media (max-width: 992px) {
      .cab-highlight-card { grid-template-columns: 1fr; }
    }
  `]
})
export class HomeComponent implements OnInit {
  apiService = inject(ApiService);
  featuredHotels: Hotel[] = [];

  ngOnInit() {
    this.apiService.getHotels().subscribe(data => {
      this.featuredHotels = data.slice(0, 3);
    });
  }

  filterCity(city: string) {
    alert(`Filtering stays & cabs for ${city}`);
  }
}
