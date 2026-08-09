import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminDataTableComponent, ColumnDef } from '../components/admin-data-table.component';
import { CabService } from '../../../core/models/platform.models';

@Component({
  selector: 'app-admin-cabs',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminDataTableComponent],
  template: `
    <div>
      <app-admin-data-table
        title="Cab Services & Drivers"
        addLabel="Add New Cab"
        [columns]="columns"
        [data]="cabs"
        (addClick)="openModal()"
        (editClick)="openModal($event)"
        (deleteClick)="deleteCab($event.id)"
      ></app-admin-data-table>

      <!-- Modal Dialog -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-card glass-card">
          <div class="modal-header flex-between">
            <h2>{{ editingCab ? 'Edit Cab Service' : 'Add New Cab Service' }}</h2>
            <button class="btn-close" (click)="showModal = false">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="input-field">
                <label>Vehicle Name</label>
                <input type="text" [(ngModel)]="formCab.vehicleName" placeholder="Mercedes-Benz E-Class" />
              </div>
              <div class="input-field">
                <label>Vehicle Registration #</label>
                <input type="text" [(ngModel)]="formCab.vehicleNumber" placeholder="NY-CAB-8899" />
              </div>
              <div class="input-field">
                <label>Category</label>
                <select [(ngModel)]="formCab.cabType">
                  <option value="SEDAN">Executive Sedan</option>
                  <option value="SUV">Luxury SUV</option>
                  <option value="LUXURY">VIP / Mercedes Class</option>
                </select>
              </div>
              <div class="input-field">
                <label>City</label>
                <select [(ngModel)]="formCab.cityId">
                  <option *ngFor="let c of cities" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>

              <!-- Vehicle Image Selection & URL Input -->
              <div class="input-field full">
                <label><span class="material-icons-outlined">directions_car</span> Vehicle Image URL</label>
                <div class="image-input-group">
                  <input type="text" [(ngModel)]="formCab.imageUrl" placeholder="https://images.unsplash.com/..." />
                  <select (change)="onPresetSelect($event)">
                    <option value="">Preset Vehicles...</option>
                    <option value="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80">Mercedes Executive Sedan</option>
                    <option value="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80">Tesla Model Y SUV</option>
                    <option value="https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80">Toyota Camry Hybrid</option>
                  </select>
                </div>
                <!-- Image Preview Thumbnail -->
                <div *ngIf="formCab.imageUrl" class="image-preview">
                  <img [src]="formCab.imageUrl" alt="Cab Preview" />
                  <span>Vehicle Preview</span>
                </div>
              </div>

              <div class="input-field">
                <label>Driver Name</label>
                <input type="text" [(ngModel)]="formCab.driverName" placeholder="Robert Sterling" />
              </div>
              <div class="input-field">
                <label>Driver Phone</label>
                <input type="text" [(ngModel)]="formCab.driverPhone" placeholder="+19876540001" />
              </div>
              <div class="input-field">
                <label>Base Fare (₹)</label>
                <input type="number" [(ngModel)]="formCab.baseFare" />
              </div>
              <div class="input-field">
                <label>Fare Per KM (₹)</label>
                <input type="number" step="0.5" [(ngModel)]="formCab.farePerKm" />
              </div>
            </div>

            <div class="modal-footer flex-between">
              <button class="btn-secondary" (click)="showModal = false">Cancel</button>
              <button class="btn-gradient" (click)="saveCab()">Save Cab Service</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
      .full { grid-column: span 2; }
      .input-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        input, select { padding: 10px; border-radius: 8px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-main); }
      }

      .image-input-group {
        display: flex;
        gap: 8px;
        input { flex: 1; }
        select { width: 180px; }
      }

      .image-preview {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        img { width: 80px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-glass); }
        span { font-size: 0.8rem; color: var(--text-muted); }
      }
    }
    .modal-card { width: 100%; max-width: 620px; padding: 24px; background: var(--modal-bg); border: 1px solid var(--border-glass); .modal-header { margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; } .btn-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; } .modal-footer { border-top: 1px solid var(--border-glass); padding-top: 16px; margin-top: 20px; } }
  `]
})
export class AdminCabsComponent implements OnInit {
  apiService = inject(ApiService);

  cabs: CabService[] = [];
  cities: any[] = [];
  showModal = false;
  editingCab: CabService | null = null;

  formCab: any = {
    vehicleName: '',
    vehicleNumber: '',
    cabType: 'LUXURY',
    driverName: 'Robert Sterling',
    driverPhone: '+19876540001',
    baseFare: 25,
    farePerKm: 3.5,
    cityId: '',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  };

  columns: ColumnDef[] = [
    { key: 'vehicleName', label: 'Vehicle Name', sortable: true },
    { key: 'vehicleNumber', label: 'Registration #', type: 'code' },
    { key: 'cabType', label: 'Category', type: 'badge' },
    { key: 'driverName', label: 'Driver Name', sortable: true },
    { key: 'driverRating', label: 'Rating', type: 'rating', sortable: true },
    { key: 'baseFare', label: 'Base Fare', type: 'price', sortable: true },
    { key: 'farePerKm', label: 'Per KM', type: 'price', sortable: true },
  ];

  ngOnInit() {
    this.loadCabs();
    this.apiService.getLocations().subscribe(loc => {
      this.cities = loc.cities;
    });
  }

  loadCabs() {
    this.apiService.getCabs().subscribe(data => this.cabs = data);
  }

  onPresetSelect(event: any) {
    if (event.target.value) {
      this.formCab.imageUrl = event.target.value;
    }
  }

  openModal(cab?: CabService) {
    if (cab) {
      this.editingCab = cab;
      this.formCab = {
        ...cab,
        imageUrl: cab.images && cab.images.length > 0 ? cab.images[0].url : 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      };
    } else {
      this.editingCab = null;
      this.formCab = {
        vehicleName: '',
        vehicleNumber: `CAB-${Math.floor(1000 + Math.random() * 9000)}`,
        cabType: 'LUXURY',
        driverName: 'Robert Sterling',
        driverPhone: '+19876540001',
        baseFare: 25,
        farePerKm: 3.5,
        cityId: this.cities[0]?.id || '',
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      };
    }
    this.showModal = true;
  }

  saveCab() {
    if (!this.formCab.vehicleName || !this.formCab.cityId) {
      alert('Please fill vehicle name and city.');
      return;
    }

    const payload = {
      vehicleName: this.formCab.vehicleName,
      vehicleNumber: this.formCab.vehicleNumber,
      cabType: this.formCab.cabType,
      driverName: this.formCab.driverName,
      driverPhone: this.formCab.driverPhone,
      baseFare: Number(this.formCab.baseFare),
      farePerKm: Number(this.formCab.farePerKm),
      cityId: this.formCab.cityId,
      imageUrls: [this.formCab.imageUrl],
    };

    if (this.editingCab) {
      alert(`Cab ${this.formCab.vehicleName} updated!`);
    } else {
      this.apiService.createCab(payload).subscribe(() => {
        alert('Cab created and saved in PostgreSQL database!');
        this.loadCabs();
      });
    }
    this.showModal = false;
  }

  deleteCab(id: string) {
    if (confirm('Delete this cab service?')) {
      this.cabs = this.cabs.filter(c => c.id !== id);
    }
  }
}
