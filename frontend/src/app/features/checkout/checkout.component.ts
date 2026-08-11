import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="checkout-page container">
      
      <!-- SUCCESS STATE: PRINTABLE E-TICKET PASS -->
      <div *ngIf="isPaid" class="success-pass-container">
        
        <div class="printable-ticket glass-card" id="e-ticket">
          <div class="ticket-header flex-between">
            <div class="brand">
              <img src="assets/logo.png" alt="Tripnest" style="width: 32px; height: 32px; border-radius: 6px;" />
              <div>
                <h2>Tripnest Pass</h2>
                <small>Official Booking Confirmation & Invoice</small>
              </div>
            </div>
            <div class="status-chip success">
              <span class="material-icons-outlined">verified</span> CONFIRMED & PAID
            </div>
          </div>

          <div class="ticket-divider"></div>

          <div class="ticket-grid">
            <div class="ticket-info">
              <div class="info-block">
                <span class="label">BOOKING REFERENCE</span>
                <strong class="value ref">{{ bookingRef }}</strong>
              </div>
              <div class="info-block">
                <span class="label">PASSENGER / GUEST</span>
                <strong class="value">{{ authService.currentUser()?.fullName }}</strong>
                <small>{{ authService.currentUser()?.email }}</small>
              </div>
              <div class="info-block">
                <span class="label">SERVICE / PROPERTY</span>
                <strong class="value">{{ itemName }}</strong>
                <small>{{ itemSubtitle }}</small>
              </div>
              <div class="info-block">
                <span class="label">DATE & SCHEDULE</span>
                <strong class="value">{{ scheduleDetails }}</strong>
              </div>
            </div>

            <!-- QR Code & Price Box -->
            <div class="ticket-qr-box">
              <div class="qr-placeholder">
                <span class="material-icons-outlined qr-icon">qr_code_2</span>
                <small>SCAN FOR ENTRY</small>
              </div>
              <div class="amount-paid">
                <span class="label">TOTAL PAID</span>
                <strong class="price">₹{{ grandTotal }}</strong>
              </div>
            </div>
          </div>

          <div class="ticket-footer flex-between">
            <span>Payment Method: {{ selectedMethod | uppercase }}</span>
            <span>Support: +91 (800) 555-WANDER</span>
          </div>
        </div>

        <div class="actions-bar">
          <button class="btn-gradient" (click)="printTicket()">
            <span class="material-icons-outlined">print</span> Print E-Ticket / Save PDF
          </button>
          <a routerLink="/profile" class="btn-secondary">
            View in My Bookings
          </a>
        </div>

      </div>

      <!-- CHECKOUT FORM STATE -->
      <div *ngIf="!isPaid" class="checkout-layout">
        
        <!-- Left: Payment Method Selection -->
        <div class="payment-methods-card glass-card">
          <h2>Select Payment Gateway</h2>
          <p class="subtitle">100% Secure Payment in Indian Rupees (₹)</p>

          <!-- Payment Tabs -->
          <div class="payment-tabs">
            <button [class.active]="selectedMethod === 'upi'" (click)="selectedMethod = 'upi'">
              <span class="material-icons-outlined">qr_code_scanner</span> UPI / GPay
            </button>
            <button [class.active]="selectedMethod === 'card'" (click)="selectedMethod = 'card'">
              <span class="material-icons-outlined">credit_card</span> Credit / Debit Card
            </button>
            <button [class.active]="selectedMethod === 'netbanking'" (click)="selectedMethod = 'netbanking'">
              <span class="material-icons-outlined">account_balance</span> Net Banking
            </button>
            <button [class.active]="selectedMethod === 'cash'" (click)="selectedMethod = 'cash'">
              <span class="material-icons-outlined">payments</span> Pay at Property
            </button>
          </div>

          <!-- TAB 1: UPI / QR CODE -->
          <div *ngIf="selectedMethod === 'upi'" class="tab-content animate-fade">
            <div class="upi-box">
              <div class="qr-preview">
                <span class="material-icons-outlined qr-big">qr_code_2</span>
                <p>Scan with GPay, PhonePe, Paytm, or BHIM</p>
              </div>
              <div class="or-divider">OR Enter Virtual Payment Address (VPA)</div>
              <div class="input-field">
                <label>UPI ID</label>
                <input type="text" [(ngModel)]="upiId" placeholder="username@upi / mobile@okaxis" />
              </div>
            </div>
          </div>

          <!-- TAB 2: CREDIT / DEBIT CARD -->
          <div *ngIf="selectedMethod === 'card'" class="tab-content animate-fade">
            <div class="form-grid">
              <div class="input-field full">
                <label>Card Number</label>
                <input type="text" [(ngModel)]="cardNumber" placeholder="4532 •••• •••• 8921" maxlength="19" />
              </div>
              <div class="input-field">
                <label>Expiry Date</label>
                <input type="text" [(ngModel)]="cardExpiry" placeholder="MM / YY" maxlength="5" />
              </div>
              <div class="input-field">
                <label>CVV / CVC</label>
                <input type="password" [(ngModel)]="cardCvv" placeholder="•••" maxlength="4" />
              </div>
            </div>
          </div>

          <!-- TAB 3: NET BANKING -->
          <div *ngIf="selectedMethod === 'netbanking'" class="tab-content animate-fade">
            <div class="input-field">
              <label>Select Bank</label>
              <select [(ngModel)]="selectedBank">
                <option value="HDFC">HDFC Bank</option>
                <option value="SBI">State Bank of India (SBI)</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="AXIS">Axis Bank</option>
              </select>
            </div>
          </div>

          <!-- TAB 4: PAY AT PROPERTY -->
          <div *ngIf="selectedMethod === 'cash'" class="tab-content animate-fade">
            <div class="info-note">
              <span class="material-icons-outlined">info</span>
              <p>You can pay cash or card directly to the hotel front desk or cab driver upon arrival.</p>
            </div>
          </div>

          <!-- Alert Box -->
          <div *ngIf="errorMessage" class="alert-box error">
            <span class="material-icons-outlined">error_outline</span> {{ errorMessage }}
          </div>

          <!-- Submit Payment Button -->
          <button class="btn-gradient btn-pay" (click)="processPayment()" [disabled]="isProcessing">
            <span *ngIf="!isProcessing">
              Complete Payment • ₹{{ grandTotal }}
            </span>
            <span *ngIf="isProcessing" class="spinner"></span>
          </button>
        </div>

        <!-- Right: Order Summary Sidebar -->
        <div class="summary-sidebar glass-card">
          <h3>Order Summary</h3>
          <div class="item-preview">
            <span class="type-pill">{{ itemType === 'hotel' ? 'HOTEL STAY' : 'CAB RIDE' }}</span>
            <h4>{{ itemName }}</h4>
            <p>{{ itemSubtitle }}</p>
          </div>

          <!-- Coupon Input -->
          <div class="coupon-box">
            <label>Have a Promo Coupon?</label>
            <div class="coupon-input">
              <input type="text" [(ngModel)]="couponCode" placeholder="e.g. TRIPNEST500" />
              <button (click)="applyCoupon()">Apply</button>
            </div>
            <small *ngIf="couponApplied" class="coupon-success">✓ Coupon Applied (-₹{{ discountAmount }})</small>
          </div>

          <div class="price-breakdown">
            <div class="row">
              <span>Base Fare / Stay Amount:</span>
              <strong>₹{{ basePrice }}</strong>
            </div>
            <div class="row">
              <span>GST Tax (18%):</span>
              <strong>₹{{ gstTax }}</strong>
            </div>
            <div *ngIf="couponApplied" class="row discount">
              <span>Promo Discount:</span>
              <strong>-₹{{ discountAmount }}</strong>
            </div>
            <div class="divider"></div>
            <div class="row total">
              <span>Grand Total:</span>
              <strong>₹{{ grandTotal }}</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .checkout-page { padding: 40px 20px; }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 30px;
    }

    .payment-methods-card {
      padding: 30px;
      h2 { font-size: 1.6rem; margin-bottom: 4px; }
      .subtitle { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; }
    }

    .payment-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
      button {
        flex: 1; padding: 12px; border-radius: 14px; border: 1px solid var(--border-glass); background: var(--btn-sec-bg); color: var(--text-muted); font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;
        &.active { background: var(--primary-gradient); color: #fff; border-color: transparent; }
      }
    }

    .tab-content {
      padding: 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid var(--border-glass); margin-bottom: 24px;
    }

    .upi-box {
      text-align: center;
      .qr-preview {
        padding: 20px; border: 2px dashed var(--border-glass); border-radius: 16px; display: inline-block; margin-bottom: 16px;
        .qr-big { font-size: 80px; color: var(--primary-accent); }
        p { font-size: 0.85rem; color: var(--text-muted); }
      }
      .or-divider { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 14px; font-weight: 700; }
    }

    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      .full { grid-column: span 2; }
    }

    .input-field {
      display: flex; flex-direction: column; gap: 6px;
      label { font-size: 0.82rem; font-weight: 600; color: var(--text-main); }
      input, select { padding: 12px; border-radius: 10px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); outline: none; }
    }

    .info-note { display: flex; gap: 10px; color: var(--text-muted); font-size: 0.9rem; align-items: center; }

    .btn-pay { width: 100%; padding: 16px; font-size: 1.1rem; font-weight: 700; }

    .summary-sidebar {
      padding: 24px; height: fit-content;
      h3 { font-size: 1.2rem; margin-bottom: 16px; }
      .item-preview {
        padding: 16px; background: rgba(255,255,255,0.04); border-radius: 14px; margin-bottom: 20px;
        .type-pill { font-size: 0.65rem; font-weight: 800; color: var(--primary-accent); background: rgba(99,102,241,0.15); padding: 2px 8px; border-radius: 10px; }
        h4 { font-size: 1.1rem; margin: 6px 0 2px 0; }
        p { font-size: 0.82rem; color: var(--text-muted); }
      }

      .coupon-box {
        margin-bottom: 20px;
        label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px; }
        .coupon-input {
          display: flex; gap: 6px;
          input { flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); font-size: 0.85rem; }
          button { padding: 8px 14px; border-radius: 8px; border: none; background: var(--primary-gradient); color: #fff; font-weight: 700; cursor: pointer; }
        }
        .coupon-success { color: #10b981; font-weight: 700; margin-top: 4px; display: block; }
      }

      .price-breakdown {
        .row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px; &.discount { color: #10b981; } &.total { font-size: 1.2rem; color: var(--text-main); font-weight: 800; } }
        .divider { height: 1px; background: var(--border-glass); margin: 12px 0; }
      }
    }

    /* E-TICKET PASS STYLES */
    .success-pass-container {
      max-width: 650px; margin: 0 auto;
    }

    .printable-ticket {
      padding: 36px; border-radius: 24px; margin-bottom: 24px;
      .ticket-header {
        .brand { display: flex; align-items: center; gap: 12px; .logo { font-size: 36px; color: var(--primary-accent); } h2 { font-size: 1.4rem; } small { color: var(--text-muted); } }
        .status-chip { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; &.success { background: rgba(16,185,129,0.15); color: #10b981; } }
      }
      .ticket-divider { height: 2px; border-top: 2px dashed var(--border-glass); margin: 24px 0; }
      .ticket-grid {
        display: grid; grid-template-columns: 1fr 180px; gap: 20px;
        .ticket-info { display: flex; flex-direction: column; gap: 16px; .info-block { .label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.05em; display: block; } .value { font-size: 1rem; color: var(--text-main); &.ref { font-family: monospace; color: var(--primary-accent); } } small { color: var(--text-muted); display: block; } } }
        .ticket-qr-box { text-align: center; .qr-placeholder { padding: 14px; border: 1px solid var(--border-glass); border-radius: 16px; margin-bottom: 12px; .qr-icon { font-size: 64px; color: var(--text-main); } small { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); } } .amount-paid { .label { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); display: block; } .price { font-size: 1.4rem; color: #10b981; } } }
      }
      .ticket-footer { margin-top: 30px; padding-top: 14px; border-top: 1px solid var(--border-glass); font-size: 0.75rem; color: var(--text-muted); }
    }

    .actions-bar { display: flex; gap: 16px; justify-content: center; }

    .spinner { display: inline-block; width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media print {
      body * { visibility: hidden; }
      #e-ticket, #e-ticket * { visibility: visible; }
      #e-ticket { position: absolute; left: 0; top: 0; width: 100%; border: none; background: #fff !important; color: #000 !important; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  apiService = inject(ApiService);
  authService = inject(AuthService);

  itemType: 'hotel' | 'cab' = 'hotel';
  itemName = 'The Grand Zenith Resort & Spa';
  itemSubtitle = 'Deluxe Ocean View Suite • 3 Nights';
  scheduleDetails = 'Check-in: Aug 10, 2026 • Check-out: Aug 13, 2026';
  
  basePrice = 3500;
  gstTax = 630;
  discountAmount = 0;
  grandTotal = 4130;

  couponCode = '';
  couponApplied = false;

  selectedMethod: 'upi' | 'card' | 'netbanking' | 'cash' = 'upi';
  upiId = 'traveler@okaxis';
  cardNumber = '4532 8901 2234 8921';
  cardExpiry = '08/28';
  cardCvv = '892';
  selectedBank = 'HDFC';

  isProcessing = false;
  isPaid = false;
  bookingRef = '';
  errorMessage = '';

  itemId = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type']) this.itemType = params['type'];
      if (params['id']) this.itemId = params['id'];
      if (params['name']) this.itemName = params['name'];
      if (params['subtitle']) this.itemSubtitle = params['subtitle'];
      if (params['price']) {
        this.basePrice = parseFloat(params['price']) || 3500;
        this.recalculateTotals();
      }
    });
  }

  recalculateTotals() {
    this.gstTax = Math.round(this.basePrice * 0.18);
    this.grandTotal = this.basePrice + this.gstTax - this.discountAmount;
  }

  applyCoupon() {
    const code = this.couponCode.toUpperCase();
    if (code === 'TRIPNEST500' || code === 'WANDERLUST500') {
      this.discountAmount = 500;
      this.couponApplied = true;
      this.recalculateTotals();
    } else {
      alert('Invalid Promo Coupon Code. Try TRIPNEST500');
    }
  }

  saveLocalBooking(newBooking: any, type: 'hotel' | 'cab') {
    const existing = JSON.parse(localStorage.getItem('wl_local_bookings') || '{"hotelBookings":[],"cabBookings":[]}');
    if (type === 'hotel') {
      existing.hotelBookings.unshift(newBooking);
    } else {
      existing.cabBookings.unshift(newBooking);
    }
    localStorage.setItem('wl_local_bookings', JSON.stringify(existing));
  }

  processPayment() {
    this.isProcessing = true;
    this.errorMessage = '';

    if (this.itemType === 'hotel') {
      const ref = `WL-HTL-${Math.floor(100000 + Math.random() * 900000)}`;
      const newBooking = {
        bookingNumber: ref,
        checkInDate: '2026-08-10',
        checkOutDate: '2026-08-13',
        totalAmount: this.grandTotal,
        status: 'CONFIRMED',
        hotel: { name: this.itemName, address: this.itemSubtitle }
      };
      this.saveLocalBooking(newBooking, 'hotel');

      this.apiService.bookHotel({
        hotelId: this.itemId || '938d13fc-55c7-4fbc-b8ad-f05cc53c6552',
        couponCode: this.couponApplied ? this.couponCode : undefined,
        paymentMethod: this.selectedMethod.toUpperCase(),
        totalAmount: this.grandTotal
      }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          this.isPaid = true;
          this.bookingRef = res.booking?.bookingNumber || ref;
        },
        error: () => {
          this.isProcessing = false;
          this.isPaid = true;
          this.bookingRef = ref;
        }
      });
    } else {
      const ref = `WL-CAB-${Math.floor(100000 + Math.random() * 900000)}`;
      const newBooking = {
        bookingNumber: ref,
        pickupLocation: this.itemSubtitle.split('➔')[0]?.trim() || 'Indira Gandhi Airport (DEL)',
        dropLocation: this.itemSubtitle.split('➔')[1]?.trim() || 'Connaught Place Hotel',
        totalAmount: this.grandTotal,
        status: 'CONFIRMED',
        cab: { vehicleName: this.itemName }
      };
      this.saveLocalBooking(newBooking, 'cab');

      this.apiService.bookCab({
        cabId: this.itemId || '166d9d82-4a8d-4e3f-9c9d-06e5e8468079',
        pickupLocation: newBooking.pickupLocation,
        dropLocation: newBooking.dropLocation,
        distanceKm: 15,
        couponCode: this.couponApplied ? this.couponCode : undefined,
        paymentMethod: this.selectedMethod.toUpperCase(),
        totalAmount: this.grandTotal
      }).subscribe({
        next: (res) => {
          this.isProcessing = false;
          this.isPaid = true;
          this.bookingRef = res.booking?.bookingNumber || ref;
        },
        error: () => {
          this.isProcessing = false;
          this.isPaid = true;
          this.bookingRef = ref;
        }
      });
    }
  }

  printTicket() {
    window.print();
  }
}
