import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();
  const isExpired = authService.isTokenExpired();

  // Si hay token y NO está expirado, el usuario está autenticado, así que redirigimos a /dashboard
  if (token && !isExpired) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Si no hay token o está expirado, permitimos el acceso a /login
  return true;
};
