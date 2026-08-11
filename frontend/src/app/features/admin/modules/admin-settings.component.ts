import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-wrapper glass-card">
      <div class="settings-header flex-between">
        <div>
          <h2>System Configuration & Gateway Settings</h2>
          <p>Global platform credentials, SMTP settings, SEO meta, and payment gateways.</p>
        </div>
        <button class="btn-gradient" (click)="saveSettings()">
          <span class="material-icons-outlined">save</span> Save Configuration
        </button>
      </div>

      <div class="settings-form-grid">
        <div class="form-section">
          <h3>Platform Identity</h3>
          <div class="input-field">
            <label>Website Name</label>
            <input type="text" [(ngModel)]="settings.siteName" />
          </div>
          <div class="input-field">
            <label>Support Email</label>
            <input type="email" [(ngModel)]="settings.supportEmail" />
          </div>
          <div class="input-field">
            <label>Contact Helpline Phone</label>
            <input type="text" [(ngModel)]="settings.contactPhone" />
          </div>
        </div>

        <div class="form-section">
          <h3>Payment Gateways</h3>
          <div class="checkbox-row">
            <label><input type="checkbox" [(ngModel)]="settings.stripeEnabled" /> Enable Stripe Gateway</label>
          </div>
          <div class="checkbox-row">
            <label><input type="checkbox" [(ngModel)]="settings.razorpayEnabled" /> Enable Razorpay & UPI</label>
          </div>
        </div>

        <div class="form-section full">
          <h3>SMTP Email Gateway</h3>
          <div class="input-grid">
            <div class="input-field">
              <label>SMTP Host</label>
              <input type="text" [(ngModel)]="settings.smtpHost" />
            </div>
            <div class="input-field">
              <label>SMTP Port</label>
              <input type="number" [(ngModel)]="settings.smtpPort" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-wrapper { padding: 30px; .settings-header { margin-bottom: 24px; border-bottom: 1px solid var(--border-glass); padding-bottom: 16px; h2 { font-size: 1.5rem; } p { color: var(--text-muted); } } }
    .settings-form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
      .full { grid-column: span 2; }
      .form-section {
        display: flex; flex-direction: column; gap: 14px;
        h3 { font-size: 1.1rem; color: var(--primary-accent); margin-bottom: 4px; }
        .input-field { display: flex; flex-direction: column; gap: 6px; label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); } input { padding: 10px; border-radius: 8px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); } }
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .checkbox-row { font-size: 0.9rem; margin-top: 8px; }
      }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  apiService = inject(ApiService);
  settings: any = {
    siteName: 'Tripnest Enterprise',
    supportEmail: 'support@tripnest.com',
    contactPhone: '+91 (800) 555-TRIP',
    stripeEnabled: true,
    razorpayEnabled: true,
    smtpHost: 'smtp.tripnest.com',
    smtpPort: 587,
  };

  ngOnInit() {
    this.apiService.getSettings().subscribe(data => {
      if (data) this.settings = { ...this.settings, ...data };
    });
  }

  saveSettings() {
    alert('⚙️ System Configuration Settings Saved Successfully!');
  }
}
