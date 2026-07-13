import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from './shared/components/global-loader.component';
import { TokenExpiryWarningComponent } from './shared/components/token-expiry-warning.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoaderComponent, TokenExpiryWarningComponent],
  template: `
    <app-token-expiry-warning></app-token-expiry-warning>
    <app-global-loader></app-global-loader>
    <router-outlet></router-outlet>
  `,
})
export class App {}
