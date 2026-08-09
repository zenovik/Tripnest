import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AdminDataTableComponent, ColumnDef } from '../components/admin-data-table.component';

@Component({
  selector: 'app-admin-cms',
  standalone: true,
  imports: [CommonModule, AdminDataTableComponent],
  template: `
    <div>
      <app-admin-data-table
        title="Homepage Banner Sliders"
        addLabel="Add Hero Banner"
        [columns]="columns"
        [data]="banners"
        (addClick)="addBannerPrompt()"
      ></app-admin-data-table>
    </div>
  `
})
export class AdminCmsComponent implements OnInit {
  apiService = inject(ApiService);
  banners: any[] = [];

  columns: ColumnDef[] = [
    { key: 'title', label: 'Banner Heading', sortable: true },
    { key: 'subtitle', label: 'Subtitle', sortable: true },
    { key: 'buttonText', label: 'Call to Action' },
    { key: 'sortOrder', label: 'Order', sortable: true },
    { key: 'isActive', label: 'Active', type: 'badge' },
  ];

  ngOnInit() {
    this.apiService.getBanners().subscribe(data => this.banners = data);
  }

  addBannerPrompt() {
    const title = prompt('Enter Hero Banner Title:');
    if (title) {
      alert(`Banner "${title}" created successfully!`);
      this.banners.unshift({
        id: `banner-${Date.now()}`,
        title,
        subtitle: 'Save up to 25% on luxury stays',
        buttonText: 'Book Now',
        sortOrder: 1,
        isActive: true,
      });
    }
  }
}
