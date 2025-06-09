import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../components/volunteering/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.auth.getToken()) {
      return true;
    }
    // Not logged in, redirect to login
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
