import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminDataTableComponent, ColumnDef } from '../components/admin-data-table.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminDataTableComponent],
  template: `
    <div>
      <div class="tabs-sub-header flex-between">
        <div class="pill-tabs">
          <button [class.active]="activeSub === 'transactions'" (click)="activeSub = 'transactions'">Transactions History</button>
          <button [class.active]="activeSub === 'coupons'" (click)="activeSub = 'coupons'">Promo Coupons</button>
        </div>
      </div>

      <app-admin-data-table
        *ngIf="activeSub === 'transactions'"
        title="Payment Transactions Audit"
        [showAddButton]="false"
        [columns]="transColumns"
        [data]="transactions"
      ></app-admin-data-table>

      <app-admin-data-table
        *ngIf="activeSub === 'coupons'"
        title="Promo Coupons"
        addLabel="Create Promo Coupon"
        [columns]="couponColumns"
        [data]="coupons"
        (addClick)="openCouponModal()"
        (deleteClick)="deleteCoupon($event.id)"
      ></app-admin-data-table>

      <!-- Coupon Modal -->
      <div *ngIf="showCouponModal" class="modal-overlay">
        <div class="modal-card glass-card">
          <div class="modal-header flex-between">
            <h2>Create New Promo Coupon</h2>
            <button class="btn-close" (click)="showCouponModal = false">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="input-field">
                <label>Coupon Code</label>
                <input type="text" [(ngModel)]="newCoupon.code" placeholder="e.g. SUMMER25" />
              </div>
              <div class="input-field">
                <label>Discount Amount (₹)</label>
                <input type="number" [(ngModel)]="newCoupon.discountAmount" />
              </div>
              <div class="input-field">
                <label>Min Order Value (₹)</label>
                <input type="number" [(ngModel)]="newCoupon.minOrderValue" />
              </div>
              <div class="input-field">
                <label>Expiry Date</label>
                <input type="date" [(ngModel)]="newCoupon.expiryDate" />
              </div>
            </div>
            <div class="modal-footer flex-between">
              <button class="btn-secondary" (click)="showCouponModal = false">Cancel</button>
              <button class="btn-gradient" (click)="saveCoupon()">Create Coupon</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .pill-tabs {
      display: flex; gap: 8px; margin-bottom: 20px;
      button {
        padding: 8px 18px; border-radius: 20px; border: 1px solid var(--border-glass); background: var(--btn-sec-bg); color: var(--text-muted); font-weight: 600; cursor: pointer;
        &.active { background: var(--primary-gradient); color: #fff; border-color: transparent; }
      }
    }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;
      .input-field { display: flex; flex-direction: column; gap: 6px; label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); } input { padding: 10px; border-radius: 8px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); } }
    }
    .modal-card { width: 100%; max-width: 550px; padding: 24px; background: var(--modal-bg); border: 1px solid var(--border-glass); .modal-header { margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; } .btn-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; } .modal-footer { border-top: 1px solid var(--border-glass); padding-top: 16px; margin-top: 20px; } }
  `]
})
export class AdminPaymentsComponent implements OnInit {
  apiService = inject(ApiService);

  activeSub: 'transactions' | 'coupons' = 'transactions';
  transactions: any[] = [];
  coupons: any[] = [];
  showCouponModal = false;

  newCoupon: any = { code: 'PROMO2026', discountAmount: 30, minOrderValue: 150, expiryDate: '2026-12-31' };

  transColumns: ColumnDef[] = [
    { key: 'transactionId', label: 'Txn ID', type: 'code', sortable: true },
    { key: 'user.fullName', label: 'Payer', sortable: true },
    { key: 'amount', label: 'Amount', type: 'price', sortable: true },
    { key: 'paymentMethod', label: 'Gateway', type: 'badge' },
    { key: 'status', label: 'Status', type: 'badge', sortable: true },
    { key: 'createdAt', label: 'Date', type: 'date', sortable: true },
  ];

  couponColumns: ColumnDef[] = [
    { key: 'code', label: 'Coupon Code', type: 'code', sortable: true },
    { key: 'discountAmount', label: 'Discount Amount', type: 'price', sortable: true },
    { key: 'minOrderValue', label: 'Min Order Value', type: 'price', sortable: true },
    { key: 'expiryDate', label: 'Expiry Date', type: 'date', sortable: true },
  ];

  ngOnInit() {
    this.apiService.getPayments().subscribe(data => {
      this.transactions = data.transactions;
      this.coupons = data.coupons;
    });
  }

  openCouponModal() {
    this.showCouponModal = true;
  }

  saveCoupon() {
    this.apiService.createCoupon(this.newCoupon).subscribe(() => {
      alert('Coupon created!');
      this.showCouponModal = false;
      this.apiService.getPayments().subscribe(data => this.coupons = data.coupons);
    });
  }

  deleteCoupon(id: string) {
    if (confirm('Delete promo coupon?')) {
      this.apiService.deleteCoupon(id).subscribe(() => {
        this.coupons = this.coupons.filter(c => c.id !== id);
      });
    }
  }
}
