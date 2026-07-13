import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';
import { ValidationService } from '../../core/services/validation.service';
import { StateCitySelectComponent } from '../../shared/components/state-city-select.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, StateCitySelectComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-rose-500">LUXORA</h1>
          <p class="text-gray-600 mt-2">Create Your Account</p>
        </div>

        <form (ngSubmit)="register()" class="space-y-6">
          <!-- Full Name & Email -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                (blur)="validateField('name')"
                (input)="validateField('name')"
                name="name"
                placeholder="John Doe"
                [ngClass]="{
                  'border-4 border-green-500 bg-green-50': isFieldValid('name'),
                  'border-4 border-red-500 bg-red-50': isFieldInvalid('name'),
                  'border-2 border-gray-300': !isFieldTouched('name')
                }"
                class="w-full px-4 py-2 rounded-lg focus:outline-none transition">
              <p *ngIf="isFieldValid('name')" class="text-green-600 text-xs mt-1">✓ Name is valid</p>
              <p *ngIf="isFieldInvalid('name')" class="text-red-600 text-xs mt-1">⚠️ Name is required</p>
            </div>

            <!-- Email with Real-time Validation -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Email Address *
                <span *ngIf="emailValidationStatus() === 'valid'" class="text-green-600 ml-2">✅</span>
                <span *ngIf="emailValidationStatus() === 'invalid'" class="text-red-600 ml-2">❌</span>
              </label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                (blur)="validateEmail()"
                (input)="validateEmail()"
                name="email"
                placeholder="john@example.com"
                [ngClass]="{
                  'border-4 border-green-500 bg-green-50': emailValidationStatus() === 'valid',
                  'border-4 border-red-500 bg-red-50': emailValidationStatus() === 'invalid',
                  'border-2 border-gray-300': emailValidationStatus() === 'pending'
                }"
                class="w-full px-4 py-2 rounded-lg focus:outline-none transition">
              <p *ngIf="emailValidationStatus() === 'valid'" class="text-green-600 text-xs mt-1">✓ Email looks good!</p>
              <p *ngIf="emailValidationStatus() === 'invalid'" class="text-red-600 text-xs mt-1">⚠️ Please enter a valid email</p>
            </div>
          </div>

          <!-- Phone & Password -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Phone with Real-time Validation -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number *
                <span *ngIf="phoneValidationStatus() === 'valid'" class="text-green-600 ml-2">✅</span>
                <span *ngIf="phoneValidationStatus() === 'invalid'" class="text-red-600 ml-2">❌</span>
              </label>
              <input
                type="tel"
                [(ngModel)]="formData.phone"
                (blur)="validatePhone()"
                (input)="validatePhone()"
                name="phone"
                placeholder="+91 98765 43210"
                [ngClass]="{
                  'border-4 border-green-500 bg-green-50': phoneValidationStatus() === 'valid',
                  'border-4 border-red-500 bg-red-50': phoneValidationStatus() === 'invalid',
                  'border-2 border-gray-300': phoneValidationStatus() === 'pending'
                }"
                class="w-full px-4 py-2 rounded-lg focus:outline-none transition">
              <div class="mt-1 text-xs text-gray-600">Character count: {{ formData.phone.length }}/20</div>
              <p *ngIf="phoneValidationStatus() === 'valid'" class="text-green-600 text-xs mt-1">✓ Phone is valid!</p>
              <p *ngIf="phoneValidationStatus() === 'invalid'" class="text-red-600 text-xs mt-1">⚠️ Phone must be 10+ digits</p>
              <p class="text-gray-600 text-xs mt-1">Format: +91 XXXXX XXXXX</p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Password *</label>
              <input
                type="password"
                [(ngModel)]="formData.password"
                (blur)="validateField('password')"
                (input)="validateField('password')"
                name="password"
                placeholder="Min 6 characters"
                [ngClass]="{
                  'border-4 border-green-500 bg-green-50': isFieldValid('password'),
                  'border-4 border-red-500 bg-red-50': isFieldInvalid('password'),
                  'border-2 border-gray-300': !isFieldTouched('password')
                }"
                class="w-full px-4 py-2 rounded-lg focus:outline-none transition">
              <p *ngIf="isFieldValid('password')" class="text-green-600 text-xs mt-1">✓ Password is valid</p>
              <p *ngIf="isFieldInvalid('password')" class="text-red-600 text-xs mt-1">⚠️ Password must be 6+ characters</p>
            </div>
          </div>

          <!-- Street Address -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Street Address *</label>
            <input
              type="text"
              [(ngModel)]="formData.address"
              (blur)="validateField('address')"
              (input)="validateField('address')"
              name="address"
              placeholder="123 Main Street, Apt 4"
              [ngClass]="{
                'border-4 border-green-500 bg-green-50': isFieldValid('address'),
                'border-4 border-red-500 bg-red-50': isFieldInvalid('address'),
                'border-2 border-gray-300': !isFieldTouched('address')
              }"
              class="w-full px-4 py-2 rounded-lg focus:outline-none transition">
            <p *ngIf="isFieldValid('address')" class="text-green-600 text-xs mt-1">✓ Address is valid</p>
            <p *ngIf="isFieldInvalid('address')" class="text-red-600 text-xs mt-1">⚠️ Address is required</p>
          </div>

          <!-- State & City Dropdowns -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Location *</label>
            <app-state-city-select
              [selectedStateId]="formData.stateId"
              [selectedCityId]="formData.cityId"
              (stateSelected)="onStateSelected($event)"
              (citySelected)="onCitySelected($event)"
              [showError]="submitted && !formData.stateId"
              stateLabel="State"
              cityLabel="City"
              statePlaceholder="-- Select State --"
              cityPlaceholder="-- Select City --">
            </app-state-city-select>
          </div>

          <!-- Postal Code & Country -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Postal Code / Zipcode -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Postal Code / Zipcode *
                <span *ngIf="zipcodeValidationStatus() === 'valid'" class="text-green-600 ml-2">✅</span>
                <span *ngIf="zipcodeValidationStatus() === 'invalid'" class="text-red-600 ml-2">❌</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.postalCode"
                (blur)="validateZipcode()"
                (input)="validateZipcode()"
                name="postalCode"
                placeholder="400001"
                maxlength="6"
                [ngClass]="{
                  'border-4 border-green-500 bg-green-50': zipcodeValidationStatus() === 'valid',
                  'border-4 border-red-500 bg-red-50': zipcodeValidationStatus() === 'invalid',
                  'border-2 border-gray-300': zipcodeValidationStatus() === 'pending'
                }"
                class="w-full px-4 py-2 rounded-lg focus:outline-none transition">
              <div class="mt-1 text-xs text-gray-600">Character count: {{ formData.postalCode.length }}/6</div>
              <p *ngIf="zipcodeValidationStatus() === 'valid'" class="text-green-600 text-xs mt-1">✓ Zipcode is valid!</p>
              <p *ngIf="zipcodeValidationStatus() === 'invalid'" class="text-red-600 text-xs mt-1">⚠️ Zipcode must be exactly 6 digits</p>
              <p class="text-gray-600 text-xs mt-1">Format: 6 digits (e.g., 400001)</p>
            </div>

            <!-- Country -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Country *</label>
              <select
                [(ngModel)]="formData.country"
                name="country"
                (change)="validateField('country')"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
                <option value="">-- Select Country --</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          <!-- Validation Summary -->
          <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-blue-900 mb-3">✨ Validation Status</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="text-sm" [ngClass]="isFieldValid('name') ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ isFieldValid('name') ? '✓' : '○' }} Full Name
              </div>
              <div class="text-sm" [ngClass]="emailValidationStatus() === 'valid' ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ emailValidationStatus() === 'valid' ? '✓' : '○' }} Email
              </div>
              <div class="text-sm" [ngClass]="phoneValidationStatus() === 'valid' ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ phoneValidationStatus() === 'valid' ? '✓' : '○' }} Phone
              </div>
              <div class="text-sm" [ngClass]="isFieldValid('password') ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ isFieldValid('password') ? '✓' : '○' }} Password
              </div>
              <div class="text-sm" [ngClass]="isFieldValid('address') ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ isFieldValid('address') ? '✓' : '○' }} Address
              </div>
              <div class="text-sm" [ngClass]="formData.stateId ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ formData.stateId ? '✓' : '○' }} State
              </div>
              <div class="text-sm" [ngClass]="formData.cityId ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ formData.cityId ? '✓' : '○' }} City
              </div>
              <div class="text-sm" [ngClass]="zipcodeValidationStatus() === 'valid' ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ zipcodeValidationStatus() === 'valid' ? '✓' : '○' }} Zipcode
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="error()" class="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 font-semibold">
            {{ error() }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage()" class="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 font-semibold">
            {{ successMessage() }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400">
            {{ isLoading() ? 'Creating Account...' : 'Create Account' }}
          </button>

          <!-- Login Link -->
          <div class="text-center border-t pt-4">
            <p class="text-gray-600 mb-2">Already have an account?</p>
            <a href="/login" class="text-rose-500 hover:text-rose-600 font-semibold">Login here</a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private validationService = inject(ValidationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);

  formData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    stateId: null as number | null,
    cityId: null as number | null,
    postalCode: '',
    country: '',
  };

  touchedFields: { [key: string]: boolean } = {};
  submitted = false;

  emailValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  phoneValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  zipcodeValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');

  error = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  validateEmail() {
    if (!this.formData.email) {
      this.emailValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidEmail(this.formData.email);
    this.emailValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validatePhone() {
    if (!this.formData.phone) {
      this.phoneValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidPhone(this.formData.phone);
    this.phoneValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validateZipcode() {
    if (!this.formData.postalCode) {
      this.zipcodeValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidZipcode(this.formData.postalCode);
    this.zipcodeValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validateField(fieldName: string) {
    this.touchedFields[fieldName] = true;
  }

  isFieldValid(fieldName: string): boolean {
    const value = (this.formData as any)[fieldName];
    const isTouched = this.touchedFields[fieldName];

    if (!isTouched) return false;

    if (fieldName === 'password') {
      return value && value.length >= 6;
    }
    return value && value.trim().length > 0;
  }

  isFieldInvalid(fieldName: string): boolean {
    const value = (this.formData as any)[fieldName];
    const isTouched = this.touchedFields[fieldName];

    if (!isTouched) return false;

    if (fieldName === 'password') {
      return !value || value.length < 6;
    }
    return !value || value.trim().length === 0;
  }

  isFieldTouched(fieldName: string): boolean {
    return this.touchedFields[fieldName] || false;
  }

  onStateSelected(stateId: number) {
    this.formData.stateId = stateId;
  }

  onCitySelected(cityId: number) {
    this.formData.cityId = cityId;
  }

  register() {
    this.submitted = true;
    this.error.set('');

    // Validate all required fields
    if (!this.formData.name || !this.formData.email || !this.formData.password || !this.formData.phone ||
        !this.formData.address || !this.formData.stateId || !this.formData.cityId || !this.formData.postalCode || !this.formData.country) {
      this.error.set('Please fill in all required fields');
      return;
    }

    // Validate email, phone, and zipcode
    if (this.emailValidationStatus() !== 'valid') {
      this.error.set('Please enter a valid email address');
      return;
    }

    if (this.phoneValidationStatus() !== 'valid') {
      this.error.set('Please enter a valid phone number (10+ digits)');
      return;
    }

    if (this.zipcodeValidationStatus() !== 'valid') {
      this.error.set('Please enter a valid 6-digit zipcode');
      return;
    }

    if (this.formData.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    this.loaderService.show('Creating your account...');

    this.authService.register(
      this.formData.email,
      this.formData.password,
      this.formData.name,
      this.formData.phone
    ).subscribe({
      next: (response) => {
        console.log('✅ Registration successful!', response);
        this.successMessage.set('✓ Account created successfully! Redirecting...');
        this.loaderService.hide();
        this.isLoading.set(false);
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        this.loaderService.hide();
        this.isLoading.set(false);

        if (error.status === 409) {
          this.error.set('Email already exists. Please use a different email.');
        } else if (error.error?.message) {
          this.error.set(error.error.message);
        } else {
          this.error.set('Registration failed. Please try again.');
        }
      }
    });
  }
}
