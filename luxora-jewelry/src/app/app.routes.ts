import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { AdminLoginComponent } from './features/auth/admin-login.component';
import { AdminRegisterComponent } from './features/auth/admin-register.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { ProfileComponent } from './features/user/profile.component';
import { ProductDetailsComponent } from './features/product/product-details.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { PaymentComponent } from './features/checkout/payment.component';
import { PaymentSuccessComponent } from './features/checkout/payment-success.component';
import { PaymentFailureComponent } from './features/checkout/payment-failure.component';
import { OrdersComponent } from './features/orders/orders.component';
import { ArchitectureDashboardComponent } from './features/analysis/architecture-dashboard.component';
import { FormValidationDemoComponent } from './features/demo/form-validation-demo.component';
import { RegisterNewComponent } from './features/test/register-new.component';
import { LocationDebugComponent } from './features/test/location-debug.component';
import { AdminOnlyGuard } from './core/guards/admin-only.guard';
import { PublicOnlyGuard } from './core/guards/public-only.guard';

export const routes: Routes = [
  // Public Routes (Accessible by everyone except admin users)
  { path: '', component: HomeComponent, canActivate: [PublicOnlyGuard] },
  { path: 'product/:id', component: ProductDetailsComponent, canActivate: [PublicOnlyGuard] },
  { path: 'cart', component: CartComponent, canActivate: [PublicOnlyGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [PublicOnlyGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [PublicOnlyGuard] },
  { path: 'payment-success/:orderId', component: PaymentSuccessComponent, canActivate: [PublicOnlyGuard] },
  { path: 'payment-failure/:orderId', component: PaymentFailureComponent, canActivate: [PublicOnlyGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [PublicOnlyGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [PublicOnlyGuard] },

  // Auth Routes
  { path: 'signin', component: LoginComponent },
  { path: 'signup', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-new', component: RegisterNewComponent },

  // Admin Routes (Admin Only)
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/register', component: AdminRegisterComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminOnlyGuard] },

  // Demo/Debug Routes
  { path: 'analysis', component: ArchitectureDashboardComponent },
  { path: 'demo', component: FormValidationDemoComponent },
  { path: 'debug-location', component: LocationDebugComponent },
];
