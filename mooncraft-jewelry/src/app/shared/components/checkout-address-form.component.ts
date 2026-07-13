import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService, State } from '../../core/services/location.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-checkout-address-form',
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

            <!-- Error Message -->
            <div *ngIf="isFieldInvalid('fullName')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('fullName') }}</span>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="john@example.com"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldInvalid('email'),
                'border-gray-300': !isFieldInvalid('email')
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">

            <!-- Error Message -->
            <div *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('email') }}</span>
            </div>
          </div>
        </div>

        <!-- Row 2: Phone Number -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            formControlName="phone"
            placeholder="+91 98765 43210"
            [ngClass]="{
              'border-red-500 bg-red-50': isFieldInvalid('phone'),
              'border-gray-300': !isFieldInvalid('phone')
            }"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">

          <!-- Error Message -->
          <div *ngIf="isFieldInvalid('phone')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            <span>{{ getErrorMessage('phone') }}</span>
          </div>
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

          <!-- Error Message -->
          <div *ngIf="isFieldInvalid('streetAddress')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            <span>{{ getErrorMessage('streetAddress') }}</span>
          </div>
        </div>

        <!-- Row 4: City & State -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- City (Dropdown) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              City *
            </label>
            <select
              formControlName="city"
              [disabled]="cityList().length === 0"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldInvalid('city'),
                'border-gray-300': !isFieldInvalid('city'),
                'bg-gray-100 cursor-not-allowed': cityList().length === 0
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">
                {{ cityList().length === 0 ? '-- Select State First --' : '-- Select City --' }}
              </option>
              <option *ngFor="let city of cityList()" [value]="city">
                {{ city }}
              </option>
            </select>

            <!-- Error Message -->
            <div *ngIf="isFieldInvalid('city')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('city') }}</span>
            </div>
          </div>

          <!-- State (Dropdown) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              State *
            </label>
            <select
              formControlName="state"
              (change)="onStateChange()"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldInvalid('state'),
                'border-gray-300': !isFieldInvalid('state')
              }"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">-- Select State --</option>
              <option *ngFor="let state of locationService.getStates()" [value]="state.code">
                {{ state.name }}
              </option>
            </select>

            <!-- Error Message -->
            <div *ngIf="isFieldInvalid('state')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('state') }}</span>
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

            <!-- Error Message -->
            <div *ngIf="isFieldInvalid('postalCode')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('postalCode') }}</span>
            </div>
          </div>

          <!-- Country (Dropdown - Pre-filled with India) -->
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
              <option value="Canada">🇨🇦 Canada</option>
              <option value="Australia">🇦🇺 Australia</option>
            </select>

            <!-- Error Message -->
            <div *ngIf="isFieldInvalid('country')" class="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>{{ getErrorMessage('country') }}</span>
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

      <!-- Info Box -->
      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-blue-900 font-semibold mb-2">💡 Form Features:</p>
        <ul class="text-blue-800 text-sm space-y-1 list-disc list-inside">
          <li>Real-time validation with error messages</li>
          <li>Auto-populating city dropdown based on state selection</li>
          <li>Pre-filled country as India</li>
          <li>Visual feedback for invalid fields (red border & background)</li>
          <li>Disabled states prevent invalid selections</li>
          <li>Form-level and field-level error messages</li>
        </ul>
      </div>
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
export class CheckoutAddressFormComponent implements OnInit {
  locationService = inject(LocationService);
  loaderService = inject(LoaderService);
  fb = inject(FormBuilder);

  addressForm!: FormGroup;
  cityList = signal<string[]>([]);
  isLoading = signal(false);
  formError = signal('');
  successMessage = signal('');

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{10,}$/)]],
      streetAddress: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
      country: ['India', Validators.required],
    });
  }

  onStateChange() {
    const stateId = this.addressForm.get('state')?.value;
    const cityControl = this.addressForm.get('city');

    // Reset city when state changes
    cityControl?.reset('');
    this.cityList.set([]);

    if (stateId) {
      this.locationService.getCitiesByStateId(stateId).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.cityList.set(response.data);
          }
        },
        error: (error: any) => {
          console.error('Error loading cities:', error);
          this.formError.set('Failed to load cities for selected state');
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.addressForm.get(fieldName);

    if (!control?.errors) return '';

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['pattern']) {
      if (fieldName === 'phone') return 'Please enter a valid phone number';
      if (fieldName === 'postalCode') return 'Postal code must be 5-6 digits';
    }

    return 'Invalid input';
  }

  getFieldLabel(fieldName: string): string {
    const labels: any = {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      streetAddress: 'Street Address',
      city: 'City',
      state: 'State',
      postalCode: 'Postal Code',
      country: 'Country'
    };
    return labels[fieldName] || fieldName;
  }

  saveAddress() {
    this.formError.set('');
    this.successMessage.set('');

    // Mark all fields as touched to show validation errors
    Object.keys(this.addressForm.controls).forEach(key => {
      this.addressForm.get(key)?.markAsTouched();
    });

    if (!this.addressForm.valid) {
      this.formError.set('Please fix all validation errors before submitting');
      return;
    }

    this.isLoading.set(true);
    this.loaderService.show('Saving address...');

    // Simulate API call
    setTimeout(() => {
      const formData = {
        ...this.addressForm.value
      };

      console.log('✅ Address saved:', formData);

      this.successMessage.set('✅ Address saved successfully! You can now proceed to checkout.');
      this.isLoading.set(false);
      this.loaderService.hide();

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage.set('');
      }, 3000);
    }, 1500);
  }

  resetForm() {
    this.addressForm.reset({ country: 'India' });
    this.cityList.set([]);
    this.formError.set('');
    this.successMessage.set('');

    // Mark all fields as untouched to hide errors
    Object.keys(this.addressForm.controls).forEach(key => {
      this.addressForm.get(key)?.markAsUntouched();
    });
  }
}
