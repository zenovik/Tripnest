import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { vendorGuard } from './core/guards/vendor.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'hotels',
    canActivate: [authGuard],
    loadComponent: () => import('./features/hotels/hotel-list.component').then(m => m.HotelListComponent),
  },
  {
    path: 'hotels/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/hotels/hotel-detail.component').then(m => m.HotelDetailComponent),
  },
  {
    path: 'cabs',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cabs/cab-list.component').then(m => m.CabListComponent),
  },
  {
    path: 'cabs/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cabs/cab-detail.component').then(m => m.CabDetailComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'vendor',
    canActivate: [vendorGuard],
    loadComponent: () => import('./features/vendor/vendor-dashboard.component').then(m => m.VendorDashboardComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminPanelComponent),
  },
  {
    path: '**',
    redirectTo: '',
  }
];
