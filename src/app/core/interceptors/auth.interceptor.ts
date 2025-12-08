import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../state/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const session = authState.session();

  if (session?.sessionToken) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.sessionToken}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
