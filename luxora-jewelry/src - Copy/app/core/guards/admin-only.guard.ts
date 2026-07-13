import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminOnlyGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('🔐 Checking admin access...');

    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      console.log('✅ Admin access granted');
      return true;
    }

    console.log('❌ Admin access denied - redirecting to home');
    this.router.navigate(['/']);
    return false;
  }
}
