import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-wrapper glass-card">
      <div class="reports-header flex-between">
        <div>
          <h2>Financial & Booking Analytics Reports</h2>
          <p>Export consolidated financial ledger and performance analytics.</p>
        </div>
        <button class="btn-gradient" (click)="downloadFullReport()">
          <span class="material-icons-outlined">download</span> Download PDF Ledger
        </button>
      </div>

      <div class="reports-grid">
        <div class="report-box glass-card">
          <span class="material-icons-outlined icon">payments</span>
          <h3>Revenue Breakdown Report</h3>
          <p>Total Net Revenue: <strong>$84,950.00</strong></p>
          <p>Hotel Commissions: <strong>$12,740.00</strong></p>
          <p>Cab Commissions: <strong>$3,820.00</strong></p>
        </div>

        <div class="report-box glass-card">
          <span class="material-icons-outlined icon">star</span>
          <h3>Top Performing Vendors</h3>
          <p>Royal Hospitality Group: <strong>$42,100</strong></p>
          <p>Sterling Chauffeurs: <strong>$14,800</strong></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-wrapper { padding: 30px; .reports-header { margin-bottom: 24px; h2 { font-size: 1.5rem; } p { color: var(--text-muted); } } }
    .reports-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .report-box { padding: 24px; .icon { font-size: 32px; color: var(--primary-accent); margin-bottom: 12px; } h3 { font-size: 1.1rem; margin-bottom: 12px; } p { margin-bottom: 8px; font-size: 0.9rem; color: var(--text-muted); strong { color: var(--text-main); } } }
  `]
})
export class AdminReportsComponent {
  downloadFullReport() {
    alert('📊 Generating & Exporting Executive Financial PDF Report...');
  }
}
