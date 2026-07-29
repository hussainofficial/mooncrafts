import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from './shared/components/global-loader.component';
import { TokenExpiryWarningComponent } from './shared/components/token-expiry-warning.component';
import { CartToastComponent } from './shared/components/cart-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoaderComponent, TokenExpiryWarningComponent, CartToastComponent],
  template: `
    <app-token-expiry-warning></app-token-expiry-warning>
    <app-global-loader></app-global-loader>
    <router-outlet></router-outlet>
    <app-cart-toast></app-cart-toast>
  `,
})
export class App {}
