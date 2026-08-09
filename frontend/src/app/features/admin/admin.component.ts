import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminHotelsComponent } from './modules/admin-hotels.component';
import { AdminCabsComponent } from './modules/admin-cabs.component';
import { AdminBookingsComponent } from './modules/admin-bookings.component';
import { AdminUsersComponent } from './modules/admin-users.component';
import { AdminLocationsComponent } from './modules/admin-locations.component';
import { AdminPaymentsComponent } from './modules/admin-payments.component';
import { AdminCmsComponent } from './modules/admin-cms.component';
import { AdminNotificationsComponent } from './modules/admin-notifications.component';
import { AdminReportsComponent } from './modules/admin-reports.component';
import { AdminSettingsComponent } from './modules/admin-settings.component';
import { AdminSystemComponent } from './modules/admin-system.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminHotelsComponent,
    AdminCabsComponent,
    AdminBookingsComponent,
    AdminUsersComponent,
    AdminLocationsComponent,
    AdminPaymentsComponent,
    AdminCmsComponent,
    AdminNotificationsComponent,
    AdminReportsComponent,
    AdminSettingsComponent,
    AdminSystemComponent,
  ],
  template: `
    <app-admin-layout>
      
      <!-- DASHBOARD -->
      <app-admin-dashboard slot="dashboard"></app-admin-dashboard>

      <!-- HOTELS -->
      <app-admin-hotels slot="hotels"></app-admin-hotels>

      <!-- CABS -->
      <app-admin-cabs slot="cabs"></app-admin-cabs>

      <!-- BOOKINGS -->
      <app-admin-bookings slot="bookings"></app-admin-bookings>

      <!-- USERS -->
      <app-admin-users slot="users"></app-admin-users>

      <!-- LOCATIONS -->
      <app-admin-locations slot="locations"></app-admin-locations>

      <!-- PAYMENTS -->
      <app-admin-payments slot="payments"></app-admin-payments>

      <!-- CMS -->
      <app-admin-cms slot="cms"></app-admin-cms>

      <!-- NOTIFICATIONS -->
      <app-admin-notifications slot="notifications"></app-admin-notifications>

      <!-- REPORTS -->
      <app-admin-reports slot="reports"></app-admin-reports>

      <!-- SETTINGS -->
      <app-admin-settings slot="settings"></app-admin-settings>

      <!-- SYSTEM AUDIT -->
      <app-admin-system slot="system"></app-admin-system>

    </app-admin-layout>
  `
})
export class AdminPanelComponent {}
