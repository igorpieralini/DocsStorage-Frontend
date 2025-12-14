import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔒 Guard verificando autenticação para:', state.url);

  if (authService.isAuthenticated()) {
    console.log('✅ Usuário autenticado');
    return true;
  }

  console.warn('❌ Usuário não autenticado - redirecionando para login');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};