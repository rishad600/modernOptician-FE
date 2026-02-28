import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminAuthGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    if (token) {
        return true;
    }

    // Not logged in, so redirect to admin login page
    router.navigate(['/auth/admin-login'], { queryParams: { returnUrl: state.url } });
    return false;
};
