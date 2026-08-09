import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AdminDataTableComponent, ColumnDef } from '../components/admin-data-table.component';

@Component({
  selector: 'app-admin-locations',
  standalone: true,
  imports: [CommonModule, AdminDataTableComponent],
  template: `
    <div>
      <app-admin-data-table
        title="Active Cities & Territories"
        addLabel="Add Destination City"
        [columns]="columns"
        [data]="cities"
        (addClick)="addCityPrompt()"
      ></app-admin-data-table>
    </div>
  `
})
export class AdminLocationsComponent implements OnInit {
  apiService = inject(ApiService);
  cities: any[] = [];

  columns: ColumnDef[] = [
    { key: 'name', label: 'City Name', sortable: true },
    { key: 'state.name', label: 'State / Region', sortable: true },
    { key: 'isPopular', label: 'Popular Destination', type: 'badge', sortable: true },
    { key: 'createdAt', label: 'Added Date', type: 'date' },
  ];

  ngOnInit() {
    this.apiService.getLocations().subscribe(data => this.cities = data.cities);
  }

  addCityPrompt() {
    const name = prompt('Enter New Destination City Name:');
    if (name) {
      alert(`City ${name} added to coverage area!`);
      this.cities.unshift({
        id: `city-${Date.now()}`,
        name,
        state: { name: 'New York', code: 'NY' },
        isPopular: true,
        createdAt: new Date(),
      });
    }
  }
}
