import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PublicOnlyGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('🌍 Checking public page access...');

    // If user is admin, redirect to dashboard
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      console.log('❌ Admin cannot access public pages - redirecting to dashboard');
      this.router.navigate(['/admin']);
      return false;
    }

    console.log('✅ Public page access granted');
    return true;
  }
}
