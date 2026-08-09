import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminDataTableComponent, ColumnDef } from '../components/admin-data-table.component';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminDataTableComponent],
  template: `
    <div>
      <div class="tabs-sub-header flex-between">
        <div class="pill-tabs">
          <button [class.active]="bookingType === 'hotel'" (click)="setBookingType('hotel')">Hotel Bookings</button>
          <button [class.active]="bookingType === 'cab'" (click)="setBookingType('cab')">Cab Bookings</button>
        </div>
      </div>

      <app-admin-data-table
        [title]="bookingType === 'hotel' ? 'Hotel Stay Bookings' : 'Chauffeur Cab Bookings'"
        [showAddButton]="false"
        [columns]="columns"
        [data]="activeData"
        (viewClick)="openInvoiceModal($event)"
        (editClick)="openInvoiceModal($event)"
      ></app-admin-data-table>

      <!-- Printable Invoice Modal Drawer -->
      <div *ngIf="selectedInvoice" class="modal-overlay">
        <div class="invoice-card glass-card">
          <div class="invoice-header flex-between">
            <div>
              <h2>WANDERLUST INVOICE</h2>
              <span class="ref-no">Ref #{{ selectedInvoice.bookingNumber }}</span>
            </div>
            <button class="btn-close" (click)="selectedInvoice = null">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="invoice-body">
            <div class="flex-between meta-row">
              <div>
                <strong>Customer Info:</strong>
                <p>{{ selectedInvoice.user?.fullName }} ({{ selectedInvoice.user?.email }})</p>
              </div>
              <div class="text-right">
                <strong>Booking Date:</strong>
                <p>{{ selectedInvoice.createdAt | date:'mediumDate' }}</p>
              </div>
            </div>

            <div class="item-summary-box">
              <div class="flex-between">
                <span>Reserved Item:</span>
                <strong>{{ selectedInvoice.hotel?.name || selectedInvoice.cab?.vehicleName || 'Wanderlust Reservation' }}</strong>
              </div>
              <div class="flex-between">
                <span>Status:</span>
                <span class="status-badge success">{{ selectedInvoice.status }}</span>
              </div>
              <div class="flex-between total-line">
                <span>Total Fare Paid:</span>
                <strong class="total-price">\${{ selectedInvoice.totalAmount }}</strong>
              </div>
            </div>

            <div class="invoice-actions flex-between">
              <button class="btn-secondary" (click)="printInvoice()">
                <span class="material-icons-outlined">print</span> Print Official Invoice
              </button>
              <button class="btn-gradient" (click)="selectedInvoice = null">Close</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .pill-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      button {
        padding: 8px 18px;
        border-radius: 20px;
        border: 1px solid var(--border-glass);
        background: var(--btn-sec-bg);
        color: var(--text-muted);
        font-weight: 600;
        cursor: pointer;
        &.active {
          background: var(--primary-gradient);
          color: #fff;
          border-color: transparent;
        }
      }
    }
    .invoice-card {
      width: 100%;
      max-width: 550px;
      padding: 30px;
      background: var(--modal-bg);
      border: 1px solid var(--border-glass);
      .invoice-header { border-bottom: 1px solid var(--border-glass); padding-bottom: 16px; margin-bottom: 20px; }
      .ref-no { color: var(--primary-accent); font-weight: 700; font-size: 0.85rem; }
      .meta-row { margin-bottom: 20px; font-size: 0.9rem; }
      .item-summary-box {
        background: var(--input-bg);
        padding: 16px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 24px;
        .total-line { border-top: 1px solid var(--border-glass); padding-top: 10px; margin-top: 6px; }
        .total-price { font-size: 1.5rem; color: var(--success); }
      }
    }
  `]
})
export class AdminBookingsComponent implements OnInit {
  apiService = inject(ApiService);

  bookingType: 'hotel' | 'cab' = 'hotel';
  hotelBookings: any[] = [];
  cabBookings: any[] = [];
  selectedInvoice: any = null;

  columns: ColumnDef[] = [
    { key: 'bookingNumber', label: 'Booking Ref #', type: 'code', sortable: true },
    { key: 'user.fullName', label: 'Customer', sortable: true },
    { key: 'totalAmount', label: 'Amount Paid', type: 'price', sortable: true },
    { key: 'status', label: 'Booking Status', type: 'badge', sortable: true },
    { key: 'createdAt', label: 'Date', type: 'date', sortable: true },
  ];

  get activeData(): any[] {
    return this.bookingType === 'hotel' ? this.hotelBookings : this.cabBookings;
  }

  ngOnInit() {
    this.apiService.getAllBookings().subscribe(data => {
      this.hotelBookings = data.hotelBookings;
      this.cabBookings = data.cabBookings;
    });
  }

  setBookingType(type: 'hotel' | 'cab') {
    this.bookingType = type;
  }

  openInvoiceModal(booking: any) {
    this.selectedInvoice = booking;
  }

  printInvoice() {
    window.print();
  }
}
