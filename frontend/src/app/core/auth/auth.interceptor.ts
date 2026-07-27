import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  if (token) {
    const expiry = localStorage.getItem('ey_session_expiry');
    if (expiry && Date.now() > Number(expiry)) {
      auth.markExpired();
      auth.logout(true);
      router.navigate(['/login']);
      return next(req);
    }

    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};