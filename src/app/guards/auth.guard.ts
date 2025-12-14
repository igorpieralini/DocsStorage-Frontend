import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    return true;
  }

  console.warn('🔒 Acesso negado. Redirecionando para login...');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};