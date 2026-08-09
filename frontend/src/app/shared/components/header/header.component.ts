import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-sticky">
      <div class="container flex-between nav-content">
        
        <!-- Brand Logo -->
        <a routerLink="/" class="brand-logo">
          <div class="logo-icon">
            <span class="material-icons-outlined">flight_takeoff</span>
          </div>
          <div class="logo-text">
            <span class="brand-name">Wanderlust</span>
            <span class="brand-tag">Travel & Hospitality</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/hotels" routerLinkActive="active">Hotels</a>
          <a routerLink="/cabs" routerLinkActive="active">Cab Booking</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="active" class="admin-link">
            <span class="material-icons-outlined">dashboard</span> Admin Panel
          </a>
        </nav>

        <!-- Right Side Actions & User Menu -->
        <div class="nav-actions">
          
          <!-- Theme Dark/Light Toggle -->
          <button (click)="themeService.toggleTheme()" class="icon-btn" [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <span class="material-icons-outlined">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <!-- Authenticated User Dropdown Menu -->
          <ng-container *ngIf="authService.currentUser(); else authButtons">
            <div class="user-menu-wrapper" (mouseleave)="isUserDropdownOpen = false">
              <div class="user-profile-pill" (click)="isUserDropdownOpen = !isUserDropdownOpen">
                <div class="avatar-wrap">
                  <img [src]="authService.currentUser()?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'" alt="Avatar" class="avatar-img" />
                  <span class="online-indicator" title="Logged In"></span>
                </div>
                <div class="user-info-box">
                  <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
                  <span class="user-role-badge">{{ authService.currentUser()?.role?.name || 'CUSTOMER' }}</span>
                </div>
                <span class="material-icons-outlined arrow-icon" [class.rotated]="isUserDropdownOpen">expand_more</span>
              </div>

              <!-- Interactive Dropdown Menu Card -->
              <div *ngIf="isUserDropdownOpen" class="user-dropdown-card glass-card">
                <div class="dropdown-header">
                  <strong>{{ authService.currentUser()?.fullName }}</strong>
                  <small>{{ authService.currentUser()?.email }}</small>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/profile" (click)="isUserDropdownOpen = false" class="dropdown-item">
                  <span class="material-icons-outlined">person</span> My Profile
                </a>
                <a routerLink="/profile" (click)="isUserDropdownOpen = false" class="dropdown-item">
                  <span class="material-icons-outlined">confirmation_number</span> My Bookings
                </a>
                <a *ngIf="authService.isVendor() || authService.isAdmin()" routerLink="/vendor" (click)="isUserDropdownOpen = false" class="dropdown-item vendor-item">
                  <span class="material-icons-outlined">storefront</span> Vendor Partner Portal
                </a>
                <a *ngIf="authService.isAdmin()" routerLink="/admin" (click)="isUserDropdownOpen = false" class="dropdown-item admin-item">
                  <span class="material-icons-outlined">dashboard</span> Enterprise Admin Panel
                </a>
                <div class="dropdown-divider"></div>
                <button (click)="onLogout()" class="dropdown-item logout-item">
                  <span class="material-icons-outlined">logout</span> Log Out
                </button>
              </div>
            </div>
          </ng-container>

          <ng-template #authButtons>
            <a routerLink="/login" class="btn-secondary">Login</a>
            <a routerLink="/register" class="btn-gradient">Register</a>
          </ng-template>

          <!-- Mobile Menu Trigger -->
          <button class="mobile-toggle" (click)="isMobileMenuOpen = !isMobileMenuOpen">
            <span class="material-icons-outlined">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>

      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-drawer" [class.open]="isMobileMenuOpen">
        <nav class="mobile-nav">
          <a routerLink="/" (click)="isMobileMenuOpen = false">Home</a>
          <a routerLink="/hotels" (click)="isMobileMenuOpen = false">Hotels</a>
          <a routerLink="/cabs" (click)="isMobileMenuOpen = false">Cab Booking</a>
          <a *ngIf="authService.isLoggedIn()" routerLink="/profile" (click)="isMobileMenuOpen = false">My Profile</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" (click)="isMobileMenuOpen = false" class="admin-link">
            <span class="material-icons-outlined">dashboard</span> Admin Panel
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar-sticky {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--bg-glass);
      backdrop-filter: var(--backdrop-blur);
      -webkit-backdrop-filter: var(--backdrop-blur);
      border-bottom: 1px solid var(--border-glass);
      padding: 12px 0;
      transition: all 0.3s ease;
    }

    .nav-content { height: 50px; }

    .brand-logo {
      display: flex; align-items: center; gap: 10px;
      .logo-icon {
        width: 42px; height: 42px; border-radius: 12px; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
      }
      .logo-text {
        display: flex; flex-direction: column;
        .brand-name { font-family: var(--font-primary); font-weight: 800; font-size: 1.3rem; line-height: 1.1; letter-spacing: -0.02em; color: var(--text-main); }
        .brand-tag { font-size: 0.65rem; color: var(--primary-accent); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
      }
    }

    .nav-links {
      display: flex; gap: 28px; align-items: center;
      a {
        font-weight: 500; font-size: 0.95rem; color: var(--text-muted); transition: color 0.2s ease; position: relative;
        &:hover, &.active { color: var(--text-main); }
        &.active::after { content: ''; position: absolute; bottom: -6px; left: 0; width: 100%; height: 2px; background: var(--primary-gradient); border-radius: 2px; }
        &.admin-link { color: #a855f7; display: flex; align-items: center; gap: 4px; font-weight: 600; }
      }
    }

    .nav-actions { display: flex; align-items: center; gap: 14px; }

    .icon-btn {
      background: var(--btn-sec-bg); border: 1px solid var(--border-glass); color: var(--text-main); width: 38px; height: 38px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;
      &:hover { background: var(--btn-sec-hover); }
    }

    .user-menu-wrapper { position: relative; }

    .user-profile-pill {
      display: flex; align-items: center; gap: 10px; background: var(--bg-card); padding: 4px 12px 4px 4px; border-radius: 30px; border: 1px solid var(--border-glass); cursor: pointer; transition: all 0.2s ease;
      &:hover { border-color: var(--primary-accent); }

      .avatar-wrap {
        position: relative;
        .avatar-img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
        .online-indicator { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: #10b981; border: 2px solid var(--bg-card); border-radius: 50%; }
      }

      .user-info-box {
        display: flex; flex-direction: column; line-height: 1.1;
        .user-name { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .user-role-badge { font-size: 0.65rem; color: var(--primary-accent); font-weight: 700; }
      }

      .arrow-icon { font-size: 18px; color: var(--text-muted); transition: transform 0.2s ease; &.rotated { transform: rotate(180deg); } }
    }

    .user-dropdown-card {
      position: absolute; top: calc(100% + 10px); right: 0; width: 230px; padding: 12px; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-glass); box-shadow: 0 15px 40px rgba(0,0,0,0.3); z-index: 1000; animation: dropDownFade 0.2s ease;

      .dropdown-header {
        padding: 6px 8px 10px 8px;
        strong { display: block; font-size: 0.9rem; color: var(--text-main); }
        small { font-size: 0.75rem; color: var(--text-muted); display: block; word-break: break-all; }
      }

      .dropdown-divider { height: 1px; background: var(--border-glass); margin: 6px 0; }

      .dropdown-item {
        display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; font-size: 0.88rem; font-weight: 500; color: var(--text-muted); text-decoration: none; background: transparent; border: none; width: 100%; text-align: left; cursor: pointer; transition: all 0.2s ease;

        &:hover { background: var(--btn-sec-bg); color: var(--text-main); }
        &.admin-item { color: #a855f7; font-weight: 600; }
        &.logout-item { color: #ef4444; &:hover { background: rgba(239, 68, 68, 0.15); } }
      }
    }

    .mobile-toggle { display: none; background: transparent; border: none; color: var(--text-main); cursor: pointer; }
    .mobile-drawer { display: none; }

    @keyframes dropDownFade { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 992px) {
      .nav-links { display: none; }
      .mobile-toggle { display: block; }
      .mobile-drawer {
        display: block; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-dark); border-bottom: 1px solid var(--border-glass); padding: 0; max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
        &.open { max-height: 300px; padding: 20px; }
        .mobile-nav { display: flex; flex-direction: column; gap: 16px; a { font-size: 1.1rem; font-weight: 600; } }
      }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  isMobileMenuOpen = false;
  isUserDropdownOpen = false;

  onLogout() {
    this.isUserDropdownOpen = false;
    this.authService.logout();
  }
}
