import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const vendorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const role = authService.currentUser()?.role?.name;
    if (role === 'VENDOR' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return true;
    }
    alert('Access Denied: You must be registered as a Hotel or Cab Vendor to access the Vendor Portal.');
    router.navigate(['/']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};
