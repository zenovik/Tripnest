import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AdminDataTableComponent, ColumnDef } from '../components/admin-data-table.component';
import { Hotel } from '../../../core/models/platform.models';

@Component({
  selector: 'app-admin-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminDataTableComponent],
  template: `
    <div>
      <app-admin-data-table
        title="Hotel Management"
        addLabel="Add New Hotel"
        [columns]="columns"
        [data]="hotels"
        (addClick)="openModal()"
        (editClick)="openModal($event)"
        (deleteClick)="deleteHotel($event.id)"
        (bulkDeleteClick)="onBulkDelete($event)"
      ></app-admin-data-table>

      <!-- Hotel Add/Edit Modal -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-card glass-card">
          <div class="modal-header flex-between">
            <h2>{{ editingHotel ? 'Edit Hotel Listing' : 'Add New Hotel' }}</h2>
            <button class="btn-close" (click)="showModal = false">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="input-field">
                <label>Hotel Name</label>
                <input type="text" [(ngModel)]="formHotel.name" placeholder="Grand Zenith Resort" />
              </div>
              <div class="input-field">
                <label>City</label>
                <select [(ngModel)]="formHotel.cityId">
                  <option *ngFor="let c of cities" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="input-field">
                <label>Price Per Night ($)</label>
                <input type="number" [(ngModel)]="formHotel.pricePerNight" />
              </div>
              <div class="input-field">
                <label>Star Rating</label>
                <input type="number" step="0.1" [(ngModel)]="formHotel.starRating" />
              </div>
              
              <!-- Image Selection & URL Upload Field -->
              <div class="input-field full">
                <label><span class="material-icons-outlined">image</span> Hotel Image URL</label>
                <div class="image-input-group">
                  <input type="text" [(ngModel)]="formHotel.imageUrl" placeholder="https://images.unsplash.com/..." />
                  <select (change)="onPresetSelect($event)">
                    <option value="">Preset Images...</option>
                    <option value="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80">Luxury Palace Resort</option>
                    <option value="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80">Beachfront Ocean Villa</option>
                    <option value="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80">Heritage Boutique Hotel</option>
                  </select>
                </div>
                <!-- Image Preview Thumbnail -->
                <div *ngIf="formHotel.imageUrl" class="image-preview">
                  <img [src]="formHotel.imageUrl" alt="Preview" />
                  <span>Image Preview</span>
                </div>
              </div>

              <div class="input-field full">
                <label>Address</label>
                <input type="text" [(ngModel)]="formHotel.address" placeholder="742 Fifth Avenue, Midtown" />
              </div>
              <div class="input-field full">
                <label>Description</label>
                <textarea [(ngModel)]="formHotel.description" rows="3" placeholder="Luxury stay experience..."></textarea>
              </div>
            </div>

            <div class="modal-footer flex-between">
              <button class="btn-secondary" (click)="showModal = false">Cancel</button>
              <button class="btn-gradient" (click)="saveHotel()">
                Save Hotel Listing
              </button>
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
        input, select, textarea {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-main);
        }
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

    .modal-card {
      width: 100%;
      max-width: 620px;
      padding: 24px;
      background: var(--modal-bg);
      border: 1px solid var(--border-glass);
      .modal-header { margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px; }
      .btn-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; }
      .modal-footer { border-top: 1px solid var(--border-glass); padding-top: 16px; margin-top: 20px; }
    }
  `]
})
export class AdminHotelsComponent implements OnInit {
  apiService = inject(ApiService);

  hotels: Hotel[] = [];
  cities: any[] = [];
  showModal = false;
  editingHotel: Hotel | null = null;

  formHotel: any = {
    name: '',
    description: '',
    address: '',
    cityId: '',
    pricePerNight: 280,
    starRating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
  };

  columns: ColumnDef[] = [
    { key: 'name', label: 'Hotel Name', sortable: true },
    { key: 'city.name', label: 'City', sortable: true },
    { key: 'starRating', label: 'Rating', type: 'rating', sortable: true },
    { key: 'pricePerNight', label: 'Price/Night', type: 'price', sortable: true },
    { key: 'discountPercent', label: 'Discount %', type: 'code' },
  ];

  ngOnInit() {
    this.loadHotels();
    this.apiService.getLocations().subscribe(loc => {
      this.cities = loc.cities;
    });
  }

  loadHotels() {
    this.apiService.getHotels().subscribe(data => this.hotels = data);
  }

  onPresetSelect(event: any) {
    if (event.target.value) {
      this.formHotel.imageUrl = event.target.value;
    }
  }

  openModal(hotel?: Hotel) {
    if (hotel) {
      this.editingHotel = hotel;
      this.formHotel = {
        ...hotel,
        imageUrl: hotel.images && hotel.images.length > 0 ? hotel.images[0].url : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      };
    } else {
      this.editingHotel = null;
      this.formHotel = {
        name: '',
        description: 'Experience unmatched luxury stay with panoramic views.',
        address: '742 Fifth Avenue',
        cityId: this.cities[0]?.id || '',
        pricePerNight: 280,
        starRating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      };
    }
    this.showModal = true;
  }

  saveHotel() {
    if (!this.formHotel.name || !this.formHotel.cityId) {
      alert('Please fill hotel name and city.');
      return;
    }

    const payload = {
      name: this.formHotel.name,
      description: this.formHotel.description,
      address: this.formHotel.address,
      cityId: this.formHotel.cityId,
      pricePerNight: Number(this.formHotel.pricePerNight),
      starRating: Number(this.formHotel.starRating),
      imageUrls: [this.formHotel.imageUrl],
    };

    if (this.editingHotel) {
      alert(`Hotel ${this.formHotel.name} updated!`);
    } else {
      this.apiService.createHotel(payload).subscribe(() => {
        alert('Hotel created and saved in PostgreSQL database!');
        this.loadHotels();
      });
    }
    this.showModal = false;
  }

  deleteHotel(id: string) {
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.apiService.deleteHotel(id).subscribe(() => {
        this.loadHotels();
      });
    }
  }

  onBulkDelete(items: any[]) {
    if (confirm(`Delete ${items.length} selected hotels?`)) {
      items.forEach(item => this.deleteHotel(item.id));
    }
  }
}
