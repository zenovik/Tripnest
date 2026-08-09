import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

export type AdminTab = 
  | 'dashboard'
  | 'hotels'
  | 'cabs'
  | 'bookings'
  | 'users'
  | 'locations'
  | 'payments'
  | 'cms'
  | 'notifications'
  | 'reports'
  | 'settings'
  | 'system';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-shell" [class.sidebar-collapsed]="isSidebarCollapsed">
      
      <!-- 1. LEFT ENTERPRISE SIDEBAR -->
      <aside class="admin-sidebar glass-card">
        
        <!-- Sidebar Brand Header -->
        <div class="sidebar-header flex-between">
          <a routerLink="/" class="brand-box">
            <div class="logo-icon">
              <span class="material-icons-outlined">flight_takeoff</span>
            </div>
            <span *ngIf="!isSidebarCollapsed" class="brand-text">Wanderlust <small>SaaS Admin</small></span>
          </a>
          <button class="toggle-btn" (click)="isSidebarCollapsed = !isSidebarCollapsed">
            <span class="material-icons-outlined">{{ isSidebarCollapsed ? 'chevron_right' : 'chevron_left' }}</span>
          </button>
        </div>

        <!-- Navigation Menu Items -->
        <nav class="sidebar-menu">
          
          <div class="menu-group">
            <span *ngIf="!isSidebarCollapsed" class="group-label">OVERVIEW</span>
            
            <a class="nav-item" [class.active]="activeTab === 'dashboard'" (click)="activeTab = 'dashboard'">
              <span class="material-icons-outlined">dashboard</span>
              <span *ngIf="!isSidebarCollapsed">Dashboard</span>
            </a>
          </div>

          <div class="menu-group">
            <span *ngIf="!isSidebarCollapsed" class="group-label">CORE MODULES</span>
            
            <a class="nav-item" [class.active]="activeTab === 'hotels'" (click)="activeTab = 'hotels'">
              <span class="material-icons-outlined">hotel</span>
              <span *ngIf="!isSidebarCollapsed">Hotel Management</span>
            </a>

            <a class="nav-item" [class.active]="activeTab === 'cabs'" (click)="activeTab = 'cabs'">
              <span class="material-icons-outlined">directions_car</span>
              <span *ngIf="!isSidebarCollapsed">Cab Management</span>
            </a>

            <a class="nav-item" [class.active]="activeTab === 'bookings'" (click)="activeTab = 'bookings'">
              <span class="material-icons-outlined">confirmation_number</span>
              <span *ngIf="!isSidebarCollapsed">Bookings Audit</span>
            </a>

            <a class="nav-item" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">
              <span class="material-icons-outlined">group</span>
              <span *ngIf="!isSidebarCollapsed">User & Roles</span>
            </a>
          </div>

          <div class="menu-group">
            <span *ngIf="!isSidebarCollapsed" class="group-label">FINANCE & LOGISTICS</span>
            
            <a class="nav-item" [class.active]="activeTab === 'locations'" (click)="activeTab = 'locations'">
              <span class="material-icons-outlined">place</span>
              <span *ngIf="!isSidebarCollapsed">Locations & Cities</span>
            </a>

            <a class="nav-item" [class.active]="activeTab === 'payments'" (click)="activeTab = 'payments'">
              <span class="material-icons-outlined">account_balance_wallet</span>
              <span *ngIf="!isSidebarCollapsed">Payments & Coupons</span>
            </a>
          </div>

          <div class="menu-group">
            <span *ngIf="!isSidebarCollapsed" class="group-label">MARKETING & SYSTEM</span>
            
            <a class="nav-item" [class.active]="activeTab === 'cms'" (click)="activeTab = 'cms'">
              <span class="material-icons-outlined">web</span>
              <span *ngIf="!isSidebarCollapsed">Content CMS</span>
            </a>

            <a class="nav-item" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">
              <span class="material-icons-outlined">notifications</span>
              <span *ngIf="!isSidebarCollapsed">Notifications</span>
            </a>

            <a class="nav-item" [class.active]="activeTab === 'reports'" (click)="activeTab = 'reports'">
              <span class="material-icons-outlined">insights</span>
              <span *ngIf="!isSidebarCollapsed">Reports & Analytics</span>
            </a>

            <a class="nav-item" [class.active]="activeTab === 'settings'" (click)="activeTab = 'settings'">
              <span class="material-icons-outlined">settings</span>
              <span *ngIf="!isSidebarCollapsed">System Settings</span>
            </a>

            <a class="nav-item" [class.active]="activeTab === 'system'" (click)="activeTab = 'system'">
              <span class="material-icons-outlined">shield</span>
              <span *ngIf="!isSidebarCollapsed">Audit & Logs</span>
            </a>
          </div>

        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <button class="nav-item logout-btn" (click)="onLogout()">
            <span class="material-icons-outlined">logout</span>
            <span *ngIf="!isSidebarCollapsed">Logout</span>
          </button>
        </div>

      </aside>

      <!-- 2. MAIN ADMIN CONTENT CONTAINER -->
      <main class="admin-main">
        
        <!-- Top Navbar Header Bar -->
        <header class="admin-topbar glass-card flex-between">
          <div class="breadcrumb-area">
            <h2>{{ getTabTitle(activeTab) }}</h2>
            <span class="status-live"><span class="pulse-dot"></span> Realtime Sync Active</span>
          </div>

          <div class="topbar-actions flex-between">
            
            <!-- Dark / Light Theme Button -->
            <button (click)="themeService.toggleTheme()" class="btn-circle-icon" [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              <span class="material-icons-outlined">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
            </button>

            <!-- Admin Profile Info -->
            <div class="admin-user-pill">
              <img [src]="authService.currentUser()?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'" alt="Admin" class="avatar" />
              <div class="user-meta">
                <strong>{{ authService.currentUser()?.fullName || 'Alex Vance' }}</strong>
                <span class="role-tag">SUPER_ADMIN</span>
              </div>
            </div>

          </div>
        </header>

        <!-- Dynamic Module Body Injection Slot -->
        <div class="module-body">

          <!-- TAB 1: DASHBOARD -->
          <ng-container *ngIf="activeTab === 'dashboard'">
            <ng-content select="[slot=dashboard]"></ng-content>
          </ng-container>

          <!-- TAB 2: HOTELS -->
          <ng-container *ngIf="activeTab === 'hotels'">
            <ng-content select="[slot=hotels]"></ng-content>
          </ng-container>

          <!-- TAB 3: CABS -->
          <ng-container *ngIf="activeTab === 'cabs'">
            <ng-content select="[slot=cabs]"></ng-content>
          </ng-container>

          <!-- TAB 4: BOOKINGS -->
          <ng-container *ngIf="activeTab === 'bookings'">
            <ng-content select="[slot=bookings]"></ng-content>
          </ng-container>

          <!-- TAB 5: USERS -->
          <ng-container *ngIf="activeTab === 'users'">
            <ng-content select="[slot=users]"></ng-content>
          </ng-container>

          <!-- TAB 6: LOCATIONS -->
          <ng-container *ngIf="activeTab === 'locations'">
            <ng-content select="[slot=locations]"></ng-content>
          </ng-container>

          <!-- TAB 7: PAYMENTS -->
          <ng-container *ngIf="activeTab === 'payments'">
            <ng-content select="[slot=payments]"></ng-content>
          </ng-container>

          <!-- TAB 8: CMS -->
          <ng-container *ngIf="activeTab === 'cms'">
            <ng-content select="[slot=cms]"></ng-content>
          </ng-container>

          <!-- TAB 9: NOTIFICATIONS -->
          <ng-container *ngIf="activeTab === 'notifications'">
            <ng-content select="[slot=notifications]"></ng-content>
          </ng-container>

          <!-- TAB 10: REPORTS -->
          <ng-container *ngIf="activeTab === 'reports'">
            <ng-content select="[slot=reports]"></ng-content>
          </ng-container>

          <!-- TAB 11: SETTINGS -->
          <ng-container *ngIf="activeTab === 'settings'">
            <ng-content select="[slot=settings]"></ng-content>
          </ng-container>

          <!-- TAB 12: SYSTEM -->
          <ng-container *ngIf="activeTab === 'system'">
            <ng-content select="[slot=system]"></ng-content>
          </ng-container>

        </div>

      </main>

    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      background: var(--bg-dark);
      color: var(--text-main);
    }

    /* Sidebar Styles */
    .admin-sidebar {
      width: 270px;
      height: 100vh;
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      border-radius: 0;
      border-right: 1px solid var(--border-glass);
      transition: width 0.3s ease;
      z-index: 100;

      .sidebar-header {
        padding: 20px;
        border-bottom: 1px solid var(--border-glass);

        .brand-box {
          display: flex;
          align-items: center;
          gap: 12px;

          .logo-icon {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: var(--primary-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }

          .brand-text {
            font-family: var(--font-primary);
            font-weight: 800;
            font-size: 1.2rem;
            display: flex;
            flex-direction: column;
            line-height: 1.1;

            small {
              font-size: 0.65rem;
              color: var(--primary-accent);
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
          }
        }

        .toggle-btn {
          background: var(--btn-sec-bg);
          border: 1px solid var(--border-glass);
          color: var(--text-main);
          width: 30px;
          height: 30px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .sidebar-menu {
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .group-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-subtle);
          letter-spacing: 0.08em;
          padding: 0 12px;
          margin-bottom: 6px;
          display: block;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;

          .material-icons-outlined { font-size: 20px; }

          &:hover {
            color: var(--text-main);
            background: var(--btn-sec-bg);
          }

          &.active {
            color: #ffffff;
            background: var(--primary-gradient);
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
          }
        }
      }

      .sidebar-footer {
        padding: 16px 12px;
        border-top: 1px solid var(--border-glass);

        .logout-btn {
          width: 100%;
          color: var(--danger);
          &:hover { background: rgba(239, 68, 68, 0.15); }
        }
      }
    }

    /* Collapsed Sidebar State */
    .admin-shell.sidebar-collapsed {
      .admin-sidebar {
        width: 74px;
      }
    }

    /* Main Section */
    .admin-main {
      flex: 1;
      padding: 24px 30px;
      overflow-y: auto;

      .admin-topbar {
        padding: 16px 24px;
        border-radius: 20px;
        margin-bottom: 24px;

        .breadcrumb-area {
          h2 { font-size: 1.5rem; }
          .status-live {
            font-size: 0.75rem;
            color: var(--success);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;

            .pulse-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: var(--success);
              box-shadow: 0 0 8px var(--success);
            }
          }
        }

        .topbar-actions {
          gap: 16px;

          .btn-circle-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1px solid var(--border-glass);
            background: var(--btn-sec-bg);
            color: var(--text-main);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .admin-user-pill {
            display: flex;
            align-items: center;
            gap: 10px;
            background: var(--input-bg);
            padding: 4px 14px 4px 4px;
            border-radius: 30px;
            border: 1px solid var(--border-glass);

            .avatar {
              width: 34px;
              height: 34px;
              border-radius: 50%;
              object-fit: cover;
            }

            .user-meta {
              display: flex;
              flex-direction: column;
              strong { font-size: 0.85rem; line-height: 1.1; }
              .role-tag { font-size: 0.65rem; color: var(--primary-accent); font-weight: 700; }
            }
          }
        }
      }
    }
  `]
})
export class AdminLayoutComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  router = inject(Router);

  activeTab: AdminTab = 'dashboard';
  isSidebarCollapsed = false;

  getTabTitle(tab: AdminTab): string {
    const titles: Record<AdminTab, string> = {
      dashboard: 'Enterprise Control Center',
      hotels: 'Luxury Hotels & Stays Management',
      cabs: 'Chauffeur Cab Fleet & Drivers',
      bookings: 'System-Wide Bookings & Invoice Audit',
      users: 'User Accounts, Roles & Permissions',
      locations: 'State, City & Popular Destinations',
      payments: 'Transactions, Wallet & Promo Coupons',
      cms: 'Website Content CMS & Testimonials',
      notifications: 'Push, Email & SMS Broadcast Center',
      reports: 'Financial & Performance Analytics',
      settings: 'Global SaaS Platform Settings',
      system: 'Security Audit Logs & Backup Logs',
    };
    return titles[tab] || 'Admin Dashboard';
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
