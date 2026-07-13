import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { LocationService, State } from '../../core/services/location.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-checkout-address-form-enhanced',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-gray-900">Delivery Address</h2>

      <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="space-y-6">
        <!-- Row 1: Full Name & Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Full Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              formControlName="fullName"
              placeholder="John Doe"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldInvalid('fullName'),
                'border-gray-300': !isFieldInvalid('fullName')
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">

            <div *ngIf="isFieldInvalid('fullName')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('fullName') }}</span>
            </div>
          </div>

          <!-- Email with Real-time Validation -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
              <span *ngIf="emailValidationStatus() === 'valid'" class="text-green-600 ml-2">✅ Valid</span>
              <span *ngIf="emailValidationStatus() === 'invalid'" class="text-red-600 ml-2">❌ Invalid</span>
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="john@example.com"
              (blur)="validateEmail()"
              [ngClass]="{
                'border-green-500 bg-green-50': emailValidationStatus() === 'valid',
                'border-red-500 bg-red-50': emailValidationStatus() === 'invalid',
                'border-gray-300': emailValidationStatus() === 'pending'
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors">

            <!-- Email Error Message -->
            <div *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getEmailErrorMessage() }}</span>
            </div>

            <!-- Email Helper Text -->
            <p *ngIf="emailValidationStatus() === 'valid'" class="mt-1 text-sm text-green-600 flex items-center gap-1">
              <span>✓</span>
              <span>Email looks good!</span>
            </p>
          </div>
        </div>

        <!-- Row 2: Phone Number with Real-time Validation -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number *
            <span *ngIf="phoneValidationStatus() === 'valid'" class="text-green-600 ml-2">✅ Valid</span>
            <span *ngIf="phoneValidationStatus() === 'invalid'" class="text-red-600 ml-2">❌ Invalid</span>
          </label>
          <div class="relative">
            <input
              type="tel"
              formControlName="phone"
              placeholder="+91 98765 43210"
              (blur)="validatePhone()"
              (input)="onPhoneInput()"
              [ngClass]="{
                'border-green-500 bg-green-50': phoneValidationStatus() === 'valid',
                'border-red-500 bg-red-50': phoneValidationStatus() === 'invalid',
                'border-gray-300': phoneValidationStatus() === 'pending'
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors">

            <!-- Phone Character Counter -->
            <span class="absolute right-3 top-3 text-sm text-gray-500">
              {{ getPhoneLength() }}/{{ getPhoneMaxLength() }}
            </span>
          </div>

          <!-- Phone Error Message -->
          <div *ngIf="isFieldInvalid('phone')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            <span>{{ getPhoneErrorMessage() }}</span>
          </div>

          <!-- Phone Helper Text -->
          <p *ngIf="phoneValidationStatus() === 'valid'" class="mt-1 text-sm text-green-600 flex items-center gap-1">
            <span>✓</span>
            <span>Phone number is valid!</span>
          </p>

          <!-- Phone Format Helper -->
          <p class="mt-1 text-xs text-gray-500">
            Format: +91 XXXXX XXXXX or 10 digits
          </p>
        </div>

        <!-- Row 3: Street Address -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Street Address *
          </label>
          <textarea
            formControlName="streetAddress"
            placeholder="123 Main Street, Apartment 4B"
            rows="3"
            [ngClass]="{
              'border-red-500 bg-red-50': isFieldInvalid('streetAddress'),
              'border-gray-300': !isFieldInvalid('streetAddress')
            }"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"></textarea>

          <div *ngIf="isFieldInvalid('streetAddress')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            <span>{{ getErrorMessage('streetAddress') }}</span>
          </div>
        </div>

        <!-- Row 4: City & State (Database-based) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- State (Database) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              State *
            </label>
            <select
              formControlName="stateId"
              (change)="onStateChange()"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldInvalid('stateId'),
                'border-gray-300': !isFieldInvalid('stateId')
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">-- Select State --</option>
              <option *ngFor="let state of states()" [value]="state.id">
                {{ state.name }}
              </option>
            </select>

            <div *ngIf="isFieldInvalid('stateId')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('stateId') }}</span>
            </div>
          </div>

          <!-- City (Database - Auto-populates) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              City *
            </label>
            <select
              formControlName="cityId"
              [disabled]="cities().length === 0"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldInvalid('cityId'),
                'border-gray-300': !isFieldInvalid('cityId'),
                'bg-gray-100 cursor-not-allowed': cities().length === 0
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
              <option value="">
                {{ cities().length === 0 ? '-- Select State First --' : '-- Select City --' }}
              </option>
              <option *ngFor="let city of cities()" [value]="city.id">
                {{ city.name }}
              </option>
            </select>

            <div *ngIf="isFieldInvalid('cityId')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('cityId') }}</span>
            </div>
          </div>
        </div>

        <!-- Row 5: Postal Code & Country -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Postal Code -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              formControlName="postalCode"
              placeholder="123456"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldInvalid('postalCode'),
                'border-gray-300': !isFieldInvalid('postalCode')
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">

            <div *ngIf="isFieldInvalid('postalCode')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('postalCode') }}</span>
            </div>
          </div>

          <!-- Country -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Country *
            </label>
            <select
              formControlName="country"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldInvalid('country'),
                'border-gray-300': !isFieldInvalid('country')
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">-- Select Country --</option>
              <option value="India">🇮🇳 India</option>
              <option value="USA">🇺🇸 United States</option>
              <option value="UK">🇬🇧 United Kingdom</option>
            </select>

            <div *ngIf="isFieldInvalid('country')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('country') }}</span>
            </div>
          </div>
        </div>

        <!-- Validation Summary Box -->
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-blue-900 font-semibold mb-2">✨ Validation Status:</p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div [ngClass]="{'text-green-600': isFieldValid('fullName'), 'text-gray-500': !isFieldValid('fullName')}">
              ✓ Full Name
            </div>
            <div [ngClass]="{'text-green-600': emailValidationStatus() === 'valid', 'text-gray-500': emailValidationStatus() !== 'valid'}">
              ✓ Email
            </div>
            <div [ngClass]="{'text-green-600': phoneValidationStatus() === 'valid', 'text-gray-500': phoneValidationStatus() !== 'valid'}">
              ✓ Phone
            </div>
            <div [ngClass]="{'text-green-600': isFieldValid('stateId'), 'text-gray-500': !isFieldValid('stateId')}">
              ✓ State
            </div>
            <div [ngClass]="{'text-green-600': isFieldValid('cityId'), 'text-gray-500': !isFieldValid('cityId')}">
              ✓ City
            </div>
            <div [ngClass]="{'text-green-600': isFieldValid('postalCode'), 'text-gray-500': !isFieldValid('postalCode')}">
              ✓ Postal
            </div>
          </div>
        </div>

        <!-- Form-level Error -->
        <div *ngIf="formError()" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 flex items-center gap-2">
            <span>❌</span>
            <span>{{ formError() }}</span>
          </p>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage()" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-700 flex items-center gap-2">
            <span>✅</span>
            <span>{{ successMessage() }}</span>
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            [disabled]="isLoading()"
            class="flex-1 bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2">
            <span *ngIf="!isLoading()">💾 Save Address</span>
            <span *ngIf="isLoading()">⏳ Saving...</span>
          </button>

          <button
            type="button"
            (click)="resetForm()"
            [disabled]="isLoading()"
            class="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 transition-colors">
            🔄 Clear
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #fde9f3;
      padding: 2rem;
    }
  `]
})
export class CheckoutAddressFormEnhancedComponent implements OnInit {
  locationService = inject(LocationService);
  loaderService = inject(LoaderService);
  fb = inject(FormBuilder);

  addressForm!: FormGroup;
  states = signal<any[]>([]);
  cities = signal<any[]>([]);
  isLoading = signal(false);
  formError = signal('');
  successMessage = signal('');
  emailValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  phoneValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');

  ngOnInit() {
    this.loadStates();
    this.initializeForm();
  }

  loadStates() {
    this.locationService.http.get<any>('http://localhost:5000/api/v1/locations/states').subscribe({
      next: (response) => {
        if (response.success) {
          this.states.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.formError.set('Failed to load states');
      }
    });
  }

  initializeForm() {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.phoneValidator.bind(this)]],
      streetAddress: ['', [Validators.required, Validators.minLength(10)]],
      cityId: ['', Validators.required],
      stateId: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
      country: ['India', Validators.required],
    });
  }

  phoneValidator(control: AbstractControl) {
    if (!control.value) return null;

    const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
    const isValid = phoneRegex.test(control.value);

    return isValid ? null : { invalidPhone: true };
  }

  validateEmail() {
    const emailControl = this.addressForm.get('email');
    if (emailControl?.value && emailControl.valid) {
      this.emailValidationStatus.set('valid');
    } else if (emailControl?.value && emailControl.invalid) {
      this.emailValidationStatus.set('invalid');
    } else {
      this.emailValidationStatus.set('pending');
    }
  }

  validatePhone() {
    const phoneControl = this.addressForm.get('phone');
    if (phoneControl?.value && phoneControl.valid) {
      this.phoneValidationStatus.set('valid');
    } else if (phoneControl?.value && phoneControl.invalid) {
      this.phoneValidationStatus.set('invalid');
    } else {
      this.phoneValidationStatus.set('pending');
    }
  }

  onPhoneInput() {
    this.validatePhone();
  }

  getPhoneLength(): number {
    const phone = this.addressForm.get('phone')?.value || '';
    return phone.length;
  }

  getPhoneMaxLength(): number {
    return 20; // Approx max length with formatting
  }

  onStateChange() {
    const stateId = this.addressForm.get('stateId')?.value;
    const cityControl = this.addressForm.get('cityId');

    cityControl?.reset('');
    this.cities.set([]);

    if (stateId) {
      this.locationService.http.get<any>(`http://localhost:5000/api/v1/locations/states/${stateId}/cities`).subscribe({
        next: (response) => {
          if (response.success) {
            this.cities.set(response.data);
          }
        },
        error: (error) => {
          console.error('Error loading cities:', error);
          this.formError.set('Failed to load cities');
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.addressForm.get(fieldName);
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return `This field is required`;
    }
    if (control.errors['minlength']) {
      return `Min ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['pattern']) {
      return 'Invalid format';
    }

    return 'Invalid input';
  }

  getEmailErrorMessage(): string {
    const control = this.addressForm.get('email');
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return 'Email is required';
    }
    if (control.errors['email']) {
      return 'Please enter a valid email format (example@email.com)';
    }

    return 'Invalid email';
  }

  getPhoneErrorMessage(): string {
    const control = this.addressForm.get('phone');
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return 'Phone number is required';
    }
    if (control.errors['invalidPhone']) {
      return 'Phone must be 10+ digits (can include +, -, spaces)';
    }

    return 'Invalid phone number';
  }

  saveAddress() {
    this.formError.set('');
    this.successMessage.set('');

    Object.keys(this.addressForm.controls).forEach(key => {
      this.addressForm.get(key)?.markAsTouched();
    });

    if (!this.addressForm.valid || this.emailValidationStatus() !== 'valid' || this.phoneValidationStatus() !== 'valid') {
      this.formError.set('Please fix all validation errors before submitting');
      return;
    }

    this.isLoading.set(true);
    this.loaderService.show('Saving address...');

    setTimeout(() => {
      const formData = {
        ...this.addressForm.value,
      };

      console.log('✅ Address saved to database:', formData);

      this.successMessage.set('✅ Address saved successfully! You can now proceed to checkout.');
      this.isLoading.set(false);
      this.loaderService.hide();

      setTimeout(() => {
        this.successMessage.set('');
      }, 3000);
    }, 1500);
  }

  resetForm() {
    this.addressForm.reset({ country: 'India' });
    this.cities.set([]);
    this.formError.set('');
    this.successMessage.set('');
    this.emailValidationStatus.set('pending');
    this.phoneValidationStatus.set('pending');

    Object.keys(this.addressForm.controls).forEach(key => {
      this.addressForm.get(key)?.markAsUntouched();
    });
  }
}
