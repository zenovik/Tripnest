import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">
      
      <!-- Top Stat Metric Cards Grid -->
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="icon-wrap purple"><span class="material-icons-outlined">hotel</span></div>
          <div>
            <span class="stat-value">{{ stats?.totalHotels || 48 }}</span>
            <span class="stat-label">Total Hotels & Stays</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="icon-wrap blue"><span class="material-icons-outlined">directions_car</span></div>
          <div>
            <span class="stat-value">{{ stats?.totalCabServices || 32 }}</span>
            <span class="stat-label">Active Cab Services</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="icon-wrap gold"><span class="material-icons-outlined">payments</span></div>
          <div>
            <span class="stat-value">₹{{ stats?.totalRevenue || 284950 }}</span>
            <span class="stat-label">Total Platform Revenue</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="icon-wrap green"><span class="material-icons-outlined">confirmation_number</span></div>
          <div>
            <span class="stat-value">{{ stats?.totalBookings || 1420 }}</span>
            <span class="stat-label">Total Bookings</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="icon-wrap cyan"><span class="material-icons-outlined">group</span></div>
          <div>
            <span class="stat-value">{{ stats?.totalUsers || 215 }}</span>
            <span class="stat-label">Registered Users</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="icon-wrap orange"><span class="material-icons-outlined">place</span></div>
          <div>
            <span class="stat-value">{{ stats?.totalCities || 14 }}</span>
            <span class="stat-label">Active Cities</span>
          </div>
        </div>
      </div>

      <!-- Analytical Revenue Chart Area -->
      <div class="chart-section glass-card">
        <div class="chart-header flex-between">
          <div>
            <h3><span class="material-icons-outlined">trending_up</span> Monthly Revenue Analytics</h3>
            <p>Financial breakdown of hotel reservations and chauffeur bookings.</p>
          </div>
          <span class="badge-gold">Monthly Financial Growth +24.8%</span>
        </div>

        <!-- Custom Responsive SVG Vector Chart -->
        <div class="svg-chart-container">
          <svg viewBox="0 0 700 200" class="revenue-svg">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <path d="M 50,160 Q 150,140 250,110 T 450,70 T 650,30 L 650,180 L 50,180 Z" fill="url(#chartGradient)" />
            <path d="M 50,160 Q 150,140 250,110 T 450,70 T 650,30" fill="none" stroke="#6366f1" stroke-width="4" />
            
            <!-- Data Points -->
            <circle cx="50" cy="160" r="5" fill="#a855f7" />
            <circle cx="150" cy="140" r="5" fill="#a855f7" />
            <circle cx="250" cy="110" r="5" fill="#a855f7" />
            <circle cx="350" cy="120" r="5" fill="#a855f7" />
            <circle cx="450" cy="70" r="5" fill="#a855f7" />
            <circle cx="550" cy="55" r="5" fill="#a855f7" />
            <circle cx="650" cy="30" r="6" fill="#ec4899" />
          </svg>
          <div class="chart-months flex-between">
            <span *ngFor="let item of monthlyRevenue">{{ item.month }} (\${{ item.revenue }})</span>
          </div>
        </div>
      </div>

      <!-- Quick Recent Activity & Latest Bookings Grid -->
      <div class="dashboard-bottom-grid">
        
        <div class="recent-card glass-card">
          <h3>Latest System Bookings</h3>
          <div class="activity-list">
            <div *ngFor="let b of recentBookings" class="activity-item flex-between">
              <div class="item-info">
                <strong>{{ b.bookingNumber }}</strong>
                <span>{{ b.hotel?.name || 'Hotel Stay' }} • {{ b.user?.fullName }}</span>
              </div>
              <strong class="price-val">\${{ b.totalAmount }}</strong>
            </div>
          </div>
        </div>

        <div class="recent-card glass-card">
          <h3>Top Platform Performance</h3>
          <div class="perf-list">
            <div class="perf-item flex-between">
              <span>The Grand Zenith Resort</span>
              <span class="rating-star">★ 4.9 (128 reviews)</span>
            </div>
            <div class="perf-item flex-between">
              <span>Mercedes-Benz E-Class</span>
              <span class="rating-star">★ 4.95 (84 rides)</span>
            </div>
            <div class="perf-item flex-between">
              <span>Pacific Breeze Beach Hotel</span>
              <span class="rating-star">★ 4.7 (96 reviews)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;

      .icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        &.purple { background: linear-gradient(135deg, #6366f1, #a855f7); }
        &.blue { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
        &.gold { background: linear-gradient(135deg, #f59e0b, #d97706); }
        &.green { background: linear-gradient(135deg, #10b981, #059669); }
        &.cyan { background: linear-gradient(135deg, #06b6d4, #3b82f6); }
        &.orange { background: linear-gradient(135deg, #f97316, #ef4444); }
      }

      .stat-value { font-size: 1.8rem; font-weight: 800; display: block; line-height: 1.1; }
      .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
    }

    .chart-section {
      padding: 24px;

      .chart-header { margin-bottom: 20px; h3 { font-size: 1.2rem; } p { font-size: 0.85rem; color: var(--text-muted); } }
      .revenue-svg { width: 100%; height: 180px; }
      .chart-months { font-size: 0.8rem; color: var(--text-muted); margin-top: 10px; }
    }

    .dashboard-bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .recent-card {
      padding: 24px;
      h3 { font-size: 1.1rem; margin-bottom: 16px; border-bottom: 1px solid var(--border-glass); padding-bottom: 10px; }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .activity-item {
          padding: 8px 0;
          border-bottom: 1px dashed var(--border-glass);
          .item-info { display: flex; flex-direction: column; span { font-size: 0.78rem; color: var(--text-muted); } }
          .price-val { color: var(--primary-accent); }
        }
      }

      .perf-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .perf-item {
          padding: 10px 12px;
          background: var(--input-bg);
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
        }
      }
    }

    @media (max-width: 992px) {
      .dashboard-bottom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  apiService = inject(ApiService);

  stats: any = null;
  monthlyRevenue: any[] = [];
  recentBookings: any[] = [];

  ngOnInit() {
    this.apiService.getAdminStats().subscribe(data => {
      this.stats = data.stats;
      this.monthlyRevenue = data.monthlyRevenue;
      this.recentBookings = data.recentBookings;
    });
  }
}
