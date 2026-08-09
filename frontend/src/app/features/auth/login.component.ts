import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      
      <!-- Left Branding & Showcase Panel -->
      <div class="showcase-panel">
        <div class="showcase-glow"></div>
        <div class="showcase-content">
          <div class="brand-badge">
            <span class="material-icons-outlined">flight_takeoff</span>
            <span>Wanderlust Enterprise</span>
          </div>

          <h1 class="showcase-heading">
            Your Gateway to <br/>
            <span class="text-gradient">Luxury Stays & Chauffeurs</span>
          </h1>

          <p class="showcase-desc">
            Experience handpicked 5-star hotels, oceanfront villas, and executive airport transfers with 100% transparent pricing in Indian Rupees (₹).
          </p>

          <!-- Floating Feature Cards -->
          <div class="feature-cards-stack">
            <div class="feature-chip card-1">
              <span class="material-icons-outlined chip-icon gold">hotel</span>
              <div>
                <strong>Luxury Stays</strong>
                <small>4.9★ Average Guest Rating</small>
              </div>
            </div>
            <div class="feature-chip card-2">
              <span class="material-icons-outlined chip-icon cyan">directions_car</span>
              <div>
                <strong>Chauffeur Rides</strong>
                <small>Verified Drivers & Electric Cabs</small>
              </div>
            </div>
            <div class="feature-chip card-3">
              <span class="material-icons-outlined chip-icon green">verified_user</span>
              <div>
                <strong>Instant Booking</strong>
                <small>Secure & Encrypted JWT Auth</small>
              </div>
            </div>
          </div>

          <!-- Bottom Quote Ticker -->
          <div class="showcase-footer">
            <p>“Wanderlust transformed our corporate travel with zero hassle.”</p>
            <span class="author">— Executive Travel Desk</span>
          </div>
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="form-panel">
        <div class="login-card glass-card">

          <!-- Success Overlay Animation -->
          <div *ngIf="showSuccessOverlay" class="success-overlay">
            <div class="success-pulse-circle">
              <span class="material-icons-outlined check-icon">check_circle</span>
            </div>
            <h2>Access Granted</h2>
            <p>Welcome back, {{ loggedInName }}!</p>
            <div class="loading-bar"></div>
          </div>
          
          <!-- Card Header -->
          <div class="card-header">
            <h2>Account Sign In</h2>
            <p>Enter your credentials to access your account dashboard</p>
          </div>

          <!-- Tab Switcher (Password vs Mobile OTP) -->
          <div class="auth-tabs">
            <button [class.active]="authMode === 'password'" (click)="setMode('password')">
              <span class="material-icons-outlined">lock</span> Password
            </button>
            <button [class.active]="authMode === 'otp'" (click)="setMode('otp')">
              <span class="material-icons-outlined">smartphone</span> Mobile OTP
            </button>
          </div>

          <!-- Alert Notifications -->
          <div *ngIf="errorMessage" class="alert-box error animate-shake">
            <span class="material-icons-outlined">error_outline</span>
            <span>{{ errorMessage }}</span>
          </div>

          <div *ngIf="successMessage && !showSuccessOverlay" class="alert-box success">
            <span class="material-icons-outlined">check_circle_outline</span>
            <span>{{ successMessage }}</span>
          </div>

          <!-- Form 1: Email & Password -->
          <form *ngIf="authMode === 'password'" (ngSubmit)="onPasswordLogin()" class="auth-form">
            <div class="input-field">
              <label>Email Address</label>
              <div class="input-inner">
                <span class="material-icons-outlined icon">email</span>
                <input 
                  type="email" 
                  [(ngModel)]="email" 
                  name="email" 
                  placeholder="admin@wanderlust.com" 
                  required 
                />
              </div>
            </div>

            <div class="input-field">
              <div class="flex-between label-row">
                <label>Password</label>
                <a href="javascript:void(0)" class="forgot-link">Forgot password?</a>
              </div>
              <div class="input-inner">
                <span class="material-icons-outlined icon">lock</span>
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                />
                <button type="button" class="eye-toggle" (click)="showPassword = !showPassword">
                  <span class="material-icons-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading" class="btn-text">
                Log In to Account <span class="material-icons-outlined arrow">arrow_forward</span>
              </span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </form>

          <!-- Form 2: Mobile OTP -->
          <form *ngIf="authMode === 'otp'" (ngSubmit)="otpSent ? onVerifyOtp() : onSendOtp()" class="auth-form">
            <div class="input-field">
              <label>Mobile Number</label>
              <div class="input-inner">
                <span class="material-icons-outlined icon">phone</span>
                <input 
                  type="tel" 
                  [(ngModel)]="phoneNumber" 
                  name="phoneNumber" 
                  placeholder="+91 98765 43210" 
                  [disabled]="otpSent"
                  required 
                />
              </div>
            </div>

            <div *ngIf="otpSent" class="input-field animate-fade">
              <div class="flex-between label-row">
                <label>6-Digit OTP Code</label>
                <a href="javascript:void(0)" (click)="otpSent = false" class="forgot-link">Change Number</a>
              </div>
              <div class="input-inner">
                <span class="material-icons-outlined icon">pin</span>
                <input 
                  type="text" 
                  [(ngModel)]="otpCode" 
                  name="otpCode" 
                  placeholder="123456" 
                  maxlength="6" 
                  required 
                />
              </div>
              <small class="hint">Demo Verification Code: <strong>123456</strong></small>
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading" class="btn-text">
                {{ otpSent ? 'Verify OTP & Log In' : 'Send Verification OTP' }} 
                <span class="material-icons-outlined arrow">arrow_forward</span>
              </span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </form>

          <!-- Demo Accounts Quick Fill Bar -->
          <div class="quick-accounts">
            <p class="quick-title">Quick Demo Login:</p>
            <div class="chip-buttons">
              <button type="button" (click)="autofill('admin@wanderlust.com', 'Admin@123')">
                <span class="dot admin"></span> Admin
              </button>
              <button type="button" (click)="autofill('vendor@wanderlust.com', 'Admin@123')">
                <span class="dot vendor"></span> Vendor
              </button>
              <button type="button" (click)="autofill('customer@wanderlust.com', 'Admin@123')">
                <span class="dot customer"></span> Customer
              </button>
            </div>
          </div>

          <!-- Card Footer Link -->
          <div class="card-footer">
            Don't have an account? 
            <a routerLink="/register" class="link-highlight">Create Account</a>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: var(--bg-dark);
    }

    /* Left Showcase Panel */
    .showcase-panel {
      position: relative;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.25), transparent 60%),
                  radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.2), transparent 60%),
                  rgba(15, 23, 42, 0.95);
      border-right: 1px solid var(--border-glass);
      overflow: hidden;

      .showcase-glow {
        position: absolute;
        width: 300px;
        height: 300px;
        background: var(--primary-accent);
        filter: blur(140px);
        opacity: 0.25;
        border-radius: 50%;
        top: -50px;
        left: -50px;
      }

      .showcase-content {
        position: relative;
        z-index: 2;
        max-width: 520px;
      }

      .brand-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: var(--primary-accent);
        padding: 6px 14px;
        border-radius: 30px;
        font-size: 0.82rem;
        font-weight: 700;
        margin-bottom: 24px;
      }

      .showcase-heading {
        font-size: 3rem;
        line-height: 1.15;
        font-weight: 800;
        margin-bottom: 20px;
        color: #ffffff;
      }

      .showcase-desc {
        font-size: 1.05rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin-bottom: 40px;
      }

      .feature-cards-stack {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 40px;

        .feature-chip {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-glass);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          transition: transform 0.3s ease;

          &:hover { transform: translateX(8px); }

          .chip-icon {
            font-size: 24px;
            padding: 10px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.08);

            &.gold { color: #f59e0b; }
            &.cyan { color: #06b6d4; }
            &.green { color: #10b981; }
          }

          strong { display: block; font-size: 0.95rem; color: #fff; }
          small { font-size: 0.78rem; color: var(--text-muted); }
        }
      }

      .showcase-footer {
        p { font-style: italic; color: var(--text-muted); font-size: 0.9rem; }
        .author { font-size: 0.8rem; font-weight: 700; color: var(--primary-accent); margin-top: 4px; display: block; }
      }
    }

    /* Right Form Panel */
    .form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      position: relative;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
      border-radius: 28px;
      background: var(--bg-card);
      border: 1px solid var(--border-glass);
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
      position: relative;
      overflow: hidden;
    }

    /* Success Overlay Animation */
    .success-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--bg-card);
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.4s ease forwards;

      .success-pulse-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.15);
        border: 2px solid #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        animation: pulseScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        .check-icon {
          font-size: 48px;
          color: #10b981;
        }
      }

      h2 { font-size: 1.6rem; color: #fff; margin-bottom: 6px; }
      p { font-size: 0.95rem; color: var(--text-muted); margin-bottom: 24px; }

      .loading-bar {
        width: 140px;
        height: 4px;
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        overflow: hidden;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 50%;
          background: var(--primary-gradient);
          animation: barSlide 1s infinite ease-in-out;
        }
      }
    }

    .card-header {
      margin-bottom: 24px;
      h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; color: var(--text-main); }
      p { font-size: 0.88rem; color: var(--text-muted); }
    }

    .auth-tabs {
      display: flex;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px;
      border-radius: 14px;
      margin-bottom: 24px;
      border: 1px solid var(--border-glass);

      button {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 10px 0;
        font-size: 0.88rem;
        font-weight: 600;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;

        &.active {
          background: var(--primary-gradient);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .input-field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label { font-size: 0.82rem; font-weight: 600; color: var(--text-main); }
      .flex-between { display: flex; justify-content: space-between; align-items: center; }
      .forgot-link { font-size: 0.78rem; color: var(--primary-accent); text-decoration: none; &:hover { text-decoration: underline; } }

      .input-inner {
        position: relative;
        display: flex;
        align-items: center;

        .icon { position: absolute; left: 14px; color: var(--text-muted); font-size: 20px; }
        
        input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 12px;
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s ease;

          &:focus {
            border-color: var(--primary-accent);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
          }
        }

        .eye-toggle {
          position: absolute; right: 12px; background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center;
          &:hover { color: var(--text-main); }
        }
      }

      .hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; strong { color: var(--primary-accent); } }
    }

    .btn-submit {
      margin-top: 8px;
      width: 100%;
      padding: 14px;
      background: var(--primary-gradient);
      border: none;
      border-radius: 14px;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.98rem;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
      transition: all 0.2s ease;

      .btn-text { display: flex; align-items: center; justify-content: center; gap: 8px; }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.45);
      }

      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }

    .quick-accounts {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border-glass);

      .quick-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }

      .chip-buttons {
        display: flex; gap: 8px;
        button {
          flex: 1; background: var(--btn-sec-bg); border: 1px solid var(--border-glass); color: var(--text-main); padding: 8px; border-radius: 10px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;
          &:hover { background: var(--btn-sec-hover); }
          .dot { width: 8px; height: 8px; border-radius: 50%; &.admin { background: #a855f7; } &.vendor { background: #3b82f6; } &.customer { background: #10b981; } }
        }
      }
    }

    .card-footer { margin-top: 20px; text-align: center; font-size: 0.85rem; color: var(--text-muted); .link-highlight { color: var(--primary-accent); font-weight: 700; text-decoration: none; margin-left: 4px; &:hover { text-decoration: underline; } } }

    .alert-box {
      display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: 500; margin-bottom: 20px;
      &.error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
      &.success { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; }
    }

    .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulseScale { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
    @keyframes barSlide { 0% { left: -50%; } 100% { left: 100%; } }

    @media (max-width: 992px) {
      .login-wrapper { grid-template-columns: 1fr; }
      .showcase-panel { display: none; }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  authMode: 'password' | 'otp' = 'password';
  email = '';
  password = '';
  phoneNumber = '+91 98765 43210';
  otpCode = '';
  otpSent = false;
  showPassword = false;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showSuccessOverlay = false;
  loggedInName = '';

  setMode(mode: 'password' | 'otp') {
    this.authMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  autofill(e: string, p: string) {
    this.email = e;
    this.password = p;
    this.setMode('password');
  }

  onPasswordLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.loggedInName = res.user?.fullName || 'Traveler';
        this.showSuccessOverlay = true;

        setTimeout(() => {
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = typeof err === 'string' ? err : 'Invalid email or password';
      }
    });
  }

  onSendOtp() {
    if (!this.phoneNumber) {
      this.errorMessage = 'Please enter a valid mobile number';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.sendOtp(this.phoneNumber).subscribe({
      next: () => {
        this.isLoading = false;
        this.otpSent = true;
        this.successMessage = 'OTP sent! Use demo code: 123456';
      },
      error: () => {
        this.isLoading = false;
        this.otpSent = true;
        this.successMessage = 'Demo OTP sent! Code: 123456';
      }
    });
  }

  onVerifyOtp() {
    if (!this.otpCode) {
      this.errorMessage = 'Please enter the 6-digit OTP code';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyOtp(this.phoneNumber, this.otpCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.loggedInName = res.user?.fullName || 'Traveler';
        this.showSuccessOverlay = true;
        setTimeout(() => this.router.navigate(['/']), 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = typeof err === 'string' ? err : 'Invalid OTP code';
      }
    });
  }
}
