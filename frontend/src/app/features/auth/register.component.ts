import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-wrapper">
      
      <!-- Left Showcase Panel -->
      <div class="showcase-panel">
        <div class="showcase-glow"></div>
        <div class="showcase-content">
          <div class="brand-badge">
            <span class="material-icons-outlined">card_travel</span>
            <span>Join Wanderlust Privileges</span>
          </div>

          <h1 class="showcase-heading">
            Unlock Exclusive <br/>
            <span class="text-gradient">Hotel Deals & Chauffeur Rides</span>
          </h1>

          <p class="showcase-desc">
            Create your account to enjoy zero booking fees, instant check-in confirmation, and luxury travel privileges across India.
          </p>

          <!-- Floating Benefit Cards -->
          <div class="feature-cards-stack">
            <div class="feature-chip card-1">
              <span class="material-icons-outlined chip-icon purple">card_giftcard</span>
              <div>
                <strong>₹500 Welcome Bonus</strong>
                <small>Auto-applied on your first luxury stay</small>
              </div>
            </div>
            <div class="feature-chip card-2">
              <span class="material-icons-outlined chip-icon pink">electric_car</span>
              <div>
                <strong>Zero Booking Surcharge</strong>
                <small>100% transparent pricing in Indian Rupees (₹)</small>
              </div>
            </div>
            <div class="feature-chip card-3">
              <span class="material-icons-outlined chip-icon cyan">support_agent</span>
              <div>
                <strong>24/7 Priority Concierge</strong>
                <small>Dedicated assistance for hotels & cabs</small>
              </div>
            </div>
          </div>

          <!-- Showcase Footer -->
          <div class="showcase-footer">
            <p>“Signing up took 30 seconds. The hotel discount code worked instantly!”</p>
            <span class="author">— Verified Wanderlust Member</span>
          </div>
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="form-panel">
        <div class="register-card glass-card">

          <!-- Success Overlay Animation -->
          <div *ngIf="showSuccessOverlay" class="success-overlay">
            <div class="success-pulse-circle">
              <span class="material-icons-outlined check-icon">check_circle</span>
            </div>
            <h2>Account Created!</h2>
            <p>Welcome to Wanderlust, {{ registeredName }}!</p>
            <div class="loading-bar"></div>
          </div>
          
          <!-- Card Header -->
          <div class="card-header">
            <h2>Create Your Account</h2>
            <p>Join thousands of travelers & hospitality partners</p>
          </div>

          <!-- Role Selection Switcher -->
          <div class="role-switcher">
            <button 
              type="button" 
              [class.selected]="selectedRole === 'CUSTOMER'" 
              (click)="selectedRole = 'CUSTOMER'">
              <span class="material-icons-outlined">person</span> Traveler / Customer
            </button>
            <button 
              type="button" 
              [class.selected]="selectedRole === 'VENDOR'" 
              (click)="selectedRole = 'VENDOR'">
              <span class="material-icons-outlined">storefront</span> Hotel/Cab Vendor
            </button>
          </div>

          <!-- Alert Notification -->
          <div *ngIf="errorMessage" class="alert-box error animate-shake">
            <span class="material-icons-outlined">error_outline</span>
            <span>{{ errorMessage }}</span>
          </div>

          <div *ngIf="successMessage && !showSuccessOverlay" class="alert-box success">
            <span class="material-icons-outlined">check_circle_outline</span>
            <span>{{ successMessage }}</span>
          </div>

          <!-- Registration Form -->
          <form (ngSubmit)="onRegister()" class="auth-form">
            
            <div class="input-field">
              <label>Full Name</label>
              <div class="input-inner">
                <span class="material-icons-outlined icon">badge</span>
                <input 
                  type="text" 
                  [(ngModel)]="fullName" 
                  name="fullName" 
                  placeholder="e.g. Sarah Jenkins" 
                  required 
                />
              </div>
            </div>

            <div class="input-field">
              <label>Email Address</label>
              <div class="input-inner">
                <span class="material-icons-outlined icon">email</span>
                <input 
                  type="email" 
                  [(ngModel)]="email" 
                  name="email" 
                  placeholder="sarah@example.com" 
                  required 
                />
              </div>
            </div>

            <div class="input-field">
              <label>Mobile Number (Optional)</label>
              <div class="input-inner">
                <span class="material-icons-outlined icon">phone</span>
                <input 
                  type="tel" 
                  [(ngModel)]="phoneNumber" 
                  name="phoneNumber" 
                  placeholder="+91 98765 43210" 
                />
              </div>
            </div>

            <div class="input-field">
              <label>Password</label>
              <div class="input-inner">
                <span class="material-icons-outlined icon">lock</span>
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password" 
                  placeholder="Minimum 6 characters" 
                  required 
                />
                <button type="button" class="eye-toggle" (click)="showPassword = !showPassword">
                  <span class="material-icons-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="terms-field">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="agreeTerms" name="agreeTerms" required />
                <span>I agree to the <a href="javascript:void(0)" class="link-highlight">Terms of Service</a> & <a href="javascript:void(0)" class="link-highlight">Privacy Policy</a></span>
              </label>
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading" class="btn-text">
                Complete Registration <span class="material-icons-outlined arrow">arrow_forward</span>
              </span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </form>

          <!-- Footer Link -->
          <div class="card-footer">
            Already have an account? 
            <a routerLink="/login" class="link-bold">Sign In</a>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .register-wrapper {
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
      background: radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.25), transparent 60%),
                  radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.2), transparent 60%),
                  rgba(15, 23, 42, 0.95);
      border-right: 1px solid var(--border-glass);
      overflow: hidden;

      .showcase-glow {
        position: absolute;
        width: 300px;
        height: 300px;
        background: #a855f7;
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
        background: rgba(168, 85, 247, 0.15);
        border: 1px solid rgba(168, 85, 247, 0.3);
        color: #c084fc;
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

      .text-gradient {
        background: linear-gradient(135deg, #c084fc 0%, #f472b6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
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

            &.purple { color: #c084fc; }
            &.pink { color: #f472b6; }
            &.cyan { color: #38bdf8; }
          }

          strong { display: block; font-size: 0.95rem; color: #fff; }
          small { font-size: 0.78rem; color: var(--text-muted); }
        }
      }

      .showcase-footer {
        p { font-style: italic; color: var(--text-muted); font-size: 0.9rem; }
        .author { font-size: 0.8rem; font-weight: 700; color: #c084fc; margin-top: 4px; display: block; }
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

    .register-card {
      width: 100%;
      max-width: 460px;
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
        background: rgba(192, 132, 252, 0.15);
        border: 2px solid #c084fc;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        animation: pulseScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        .check-icon {
          font-size: 48px;
          color: #c084fc;
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
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          animation: barSlide 1s infinite ease-in-out;
        }
      }
    }

    .card-header {
      margin-bottom: 20px;
      h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; color: var(--text-main); }
      p { font-size: 0.88rem; color: var(--text-muted); }
    }

    .role-switcher {
      display: flex;
      gap: 10px;
      margin-bottom: 22px;

      button {
        flex: 1;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-glass);
        color: var(--text-muted);
        padding: 10px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;

        .material-icons-outlined { font-size: 18px; }

        &.selected {
          background: rgba(168, 85, 247, 0.18);
          border-color: rgba(168, 85, 247, 0.4);
          color: #c084fc;
        }
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .input-field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label { font-size: 0.82rem; font-weight: 600; color: var(--text-main); }

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
            border-color: #a855f7;
            box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.25);
          }
        }

        .eye-toggle {
          position: absolute; right: 12px; background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center;
          &:hover { color: var(--text-main); }
        }
      }
    }

    .terms-field {
      margin-top: 4px;
      .checkbox-label {
        display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); cursor: pointer;
        input[type="checkbox"] { accent-color: #a855f7; width: 16px; height: 16px; }
        .link-highlight { color: #c084fc; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
      }
    }

    .btn-submit {
      margin-top: 8px;
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
      border: none;
      border-radius: 14px;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.98rem;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.35);
      transition: all 0.2s ease;

      .btn-text { display: flex; align-items: center; justify-content: center; gap: 8px; }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(168, 85, 247, 0.45);
      }

      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }

    .card-footer { margin-top: 20px; text-align: center; font-size: 0.85rem; color: var(--text-muted); .link-bold { color: #c084fc; font-weight: 700; text-decoration: none; margin-left: 4px; &:hover { text-decoration: underline; } } }

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
      .register-wrapper { grid-template-columns: 1fr; }
      .showcase-panel { display: none; }
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  phoneNumber = '';
  password = '';
  selectedRole: 'CUSTOMER' | 'VENDOR' = 'CUSTOMER';
  agreeTerms = false;
  showPassword = false;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showSuccessOverlay = false;
  registeredName = '';

  onRegister() {
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'Please complete all required fields';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (!this.agreeTerms) {
      this.errorMessage = 'Please agree to the Terms of Service to continue';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber || undefined,
      roleName: this.selectedRole
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.registeredName = this.fullName;
        this.showSuccessOverlay = true;
        setTimeout(() => this.router.navigate(['/']), 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = typeof err === 'string' ? err : 'Registration failed. Email may already be registered.';
      }
    });
  }
}
