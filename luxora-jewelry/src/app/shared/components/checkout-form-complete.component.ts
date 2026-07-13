import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '../../core/services/location.service';
import { ValidationService } from '../../core/services/validation.service';
import { LoaderService } from '../../core/services/loader.service';
import { StateCitySelectComponent } from './state-city-select.component';

@Component({
  selector: 'app-checkout-form-complete',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StateCitySelectComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-gray-900">Delivery Address</h2>

      <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="space-y-6">
        <!-- Row 1: Full Name & Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Full Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              formControlName="fullName"
              placeholder="John Doe"
              [ngClass]="{
                'border-red-500 bg-red-50': isFieldTouched('fullName') && isFieldInvalid('fullName'),
                'border-green-500 bg-green-50': isFieldTouched('fullName') && isFieldValid('fullName'),
                'border-gray-300': !isFieldTouched('fullName')
              }"
              class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition">
            <p *ngIf="isFieldTouched('fullName') && isFieldValid('fullName')" class="text-green-600 text-xs mt-1">
              ✓ Name is valid
            </p>
            <p *ngIf="isFieldTouched('fullName') && isFieldInvalid('fullName')" class="text-red-600 text-xs mt-1">
              {{ validationService.getErrorMessage('Full Name', getFieldErrors('fullName')) }}
            </p>
          </div>

          <!-- Email with Real-time Validation -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
              <span *ngIf="emailValidationStatus() === 'valid'" class="text-green-600 ml-2">✅</span>
              <span *ngIf="emailValidationStatus() === 'invalid'" class="text-red-600 ml-2">❌</span>
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="john@example.com"
              (blur)="validateEmail()"
              (input)="validateEmail()"
              [ngClass]="{
                'border-red-500 bg-red-50': emailValidationStatus() === 'invalid',
                'border-green-500 bg-green-50': emailValidationStatus() === 'valid',
                'border-gray-300': emailValidationStatus() === 'pending'
              }"
              class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition">
            <p *ngIf="emailValidationStatus() === 'valid'" class="text-green-600 text-xs mt-1">
              ✓ Email looks good!
            </p>
            <p *ngIf="emailValidationStatus() === 'invalid'" class="text-red-600 text-xs mt-1">
              ⚠️ Please enter a valid email (example@email.com)
            </p>
          </div>
        </div>

        <!-- Row 2: Phone & Country -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Phone with Real-time Validation -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
              <span *ngIf="phoneValidationStatus() === 'valid'" class="text-green-600 ml-2">✅</span>
              <span *ngIf="phoneValidationStatus() === 'invalid'" class="text-red-600 ml-2">❌</span>
            </label>
            <input
              type="tel"
              formControlName="phone"
              placeholder="+91 98765 43210"
              (blur)="validatePhone()"
              (input)="validatePhone()"
              [ngClass]="{
                'border-red-500 bg-red-50': phoneValidationStatus() === 'invalid',
                'border-green-500 bg-green-50': phoneValidationStatus() === 'valid',
                'border-gray-300': phoneValidationStatus() === 'pending'
              }"
              class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition">
            <div class="mt-1 text-xs text-gray-600">
              Character count: {{ (addressForm.get('phone')?.value || '').length }}/20
            </div>
            <p *ngIf="phoneValidationStatus() === 'valid'" class="text-green-600 text-xs mt-1">
              ✓ Phone number is valid!
            </p>
            <p *ngIf="phoneValidationStatus() === 'invalid'" class="text-red-600 text-xs mt-1">
              ⚠️ Phone must be 10+ digits (can include +, -, spaces)
            </p>
            <p class="text-gray-600 text-xs mt-2">
              Format: +91 XXXXX XXXXX or 10 digits
            </p>
          </div>

          <!-- Country -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
            <select
              formControlName="country"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500">
              <option value="">-- Select Country --</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>

        <!-- Row 3: Street Address -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
          <input
            type="text"
            formControlName="streetAddress"
            placeholder="123 Main Street, Apt 4"
            [ngClass]="{
              'border-red-500 bg-red-50': isFieldTouched('streetAddress') && isFieldInvalid('streetAddress'),
              'border-green-500 bg-green-50': isFieldTouched('streetAddress') && isFieldValid('streetAddress'),
              'border-gray-300': !isFieldTouched('streetAddress')
            }"
            class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition">
          <p *ngIf="isFieldTouched('streetAddress') && isFieldValid('streetAddress')" class="text-green-600 text-xs mt-1">
            ✓ Address is valid
          </p>
          <p *ngIf="isFieldTouched('streetAddress') && isFieldInvalid('streetAddress')" class="text-red-600 text-xs mt-1">
            {{ validationService.getErrorMessage('Street Address', getFieldErrors('streetAddress')) }}
          </p>
        </div>

        <!-- Row 4: State & City (Using Reusable Component) -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-4">Location *</label>
          <app-state-city-select
            #stateCity
            [selectedStateId]="selectedStateId"
            [selectedCityId]="selectedCityId"
            (stateSelected)="onStateSelected($event)"
            (citySelected)="onCitySelected($event)"
            [showError]="showLocationError"
            stateLabel="State"
            cityLabel="City"
            statePlaceholder="-- Select State --"
            cityPlaceholder="-- Select City --">
          </app-state-city-select>
        </div>

        <!-- Row 5: Postal Code (Zipcode) with Validation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Postal Code / Zipcode -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Postal Code / Zipcode *
              <span *ngIf="zipcodeValidationStatus() === 'valid'" class="text-green-600 ml-2">✅</span>
              <span *ngIf="zipcodeValidationStatus() === 'invalid'" class="text-red-600 ml-2">❌</span>
            </label>
            <input
              type="text"
              formControlName="postalCode"
              placeholder="400001"
              (blur)="validateZipcode()"
              (input)="validateZipcode()"
              maxlength="6"
              [ngClass]="{
                'border-red-500 bg-red-50': zipcodeValidationStatus() === 'invalid',
                'border-green-500 bg-green-50': zipcodeValidationStatus() === 'valid',
                'border-gray-300': zipcodeValidationStatus() === 'pending'
              }"
              class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition">
            <div class="mt-1 text-xs text-gray-600">
              Character count: {{ (addressForm.get('postalCode')?.value || '').length }}/6
            </div>
            <p *ngIf="zipcodeValidationStatus() === 'valid'" class="text-green-600 text-xs mt-1">
              ✓ Zipcode is valid!
            </p>
            <p *ngIf="zipcodeValidationStatus() === 'invalid'" class="text-red-600 text-xs mt-1">
              ⚠️ Zipcode must be exactly 6 digits
            </p>
            <p class="text-gray-600 text-xs mt-2">
              Format: 6 digits (e.g., 400001)
            </p>
          </div>
        </div>

        <!-- Validation Summary -->
        <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
          <h3 class="text-sm font-semibold text-blue-900 mb-3">✨ Validation Status</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div class="text-sm" [ngClass]="isFieldValid('fullName') ? 'text-green-600 font-medium' : 'text-gray-500'">
              {{ isFieldValid('fullName') ? '✓' : '○' }} Full Name
            </div>
            <div class="text-sm" [ngClass]="emailValidationStatus() === 'valid' ? 'text-green-600 font-medium' : 'text-gray-500'">
              {{ emailValidationStatus() === 'valid' ? '✓' : '○' }} Email
            </div>
            <div class="text-sm" [ngClass]="phoneValidationStatus() === 'valid' ? 'text-green-600 font-medium' : 'text-gray-500'">
              {{ phoneValidationStatus() === 'valid' ? '✓' : '○' }} Phone
            </div>
            <div class="text-sm" [ngClass]="isFieldValid('streetAddress') ? 'text-green-600 font-medium' : 'text-gray-500'">
              {{ isFieldValid('streetAddress') ? '✓' : '○' }} Address
            </div>
            <div class="text-sm" [ngClass]="selectedStateId ? 'text-green-600 font-medium' : 'text-gray-500'">
              {{ selectedStateId ? '✓' : '○' }} State
            </div>
            <div class="text-sm" [ngClass]="selectedCityId ? 'text-green-600 font-medium' : 'text-gray-500'">
              {{ selectedCityId ? '✓' : '○' }} City
            </div>
            <div class="text-sm" [ngClass]="zipcodeValidationStatus() === 'valid' ? 'text-green-600 font-medium' : 'text-gray-500'">
              {{ zipcodeValidationStatus() === 'valid' ? '✓' : '○' }} Zipcode
            </div>
            <div class="text-sm" [ngClass]="isFieldValid('country') ? 'text-green-600 font-medium' : 'text-gray-500'">
              {{ isFieldValid('country') ? '✓' : '○' }} Country
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="formError()" class="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p class="text-red-700 text-sm font-medium">{{ formError() }}</p>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage()" class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p class="text-green-700 text-sm font-medium">{{ successMessage() }}</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            [disabled]="isLoading()"
            class="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:bg-gray-400">
            {{ isLoading() ? 'Saving...' : 'Save Address' }}
          </button>
          <button
            type="button"
            (click)="clearForm()"
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition">
            Clear
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CheckoutFormCompleteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);
  public validationService = inject(ValidationService);
  private loaderService = inject(LoaderService);

  addressForm!: FormGroup;
  selectedStateId: number | null = null;
  selectedCityId: number | null = null;
  showLocationError = false;

  emailValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  phoneValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  zipcodeValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  isLoading = signal(false);
  formError = signal('');
  successMessage = signal('');

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, this.validationService.emailValidator()]],
      phone: ['', [Validators.required, this.validationService.phoneValidator()]],
      streetAddress: ['', [Validators.required, Validators.minLength(5)]],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required],
      postalCode: ['', [Validators.required, this.validationService.zipcodeValidator()]],
      country: ['India', Validators.required]
    });
  }

  validateEmail() {
    const emailControl = this.addressForm.get('email');
    if (!emailControl?.value) {
      this.emailValidationStatus.set('pending');
      return;
    }

    const isValid = this.validationService.isValidEmail(emailControl.value);
    this.emailValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validatePhone() {
    const phoneControl = this.addressForm.get('phone');
    if (!phoneControl?.value) {
      this.phoneValidationStatus.set('pending');
      return;
    }

    const isValid = this.validationService.isValidPhone(phoneControl.value);
    this.phoneValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validateZipcode() {
    const zipcodeControl = this.addressForm.get('postalCode');
    if (!zipcodeControl?.value) {
      this.zipcodeValidationStatus.set('pending');
      return;
    }

    const isValid = this.validationService.isValidZipcode(zipcodeControl.value);
    this.zipcodeValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  onStateSelected(stateId: number) {
    this.selectedStateId = stateId;
    this.addressForm.patchValue({ stateId });
    this.showLocationError = false;
  }

  onCitySelected(cityId: number) {
    this.selectedCityId = cityId;
    this.addressForm.patchValue({ cityId });
    this.showLocationError = false;
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return field ? field.valid && field.touched : false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  isFieldTouched(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return field ? field.touched : false;
  }

  getFieldErrors(fieldName: string) {
    return this.addressForm.get(fieldName)?.errors || null;
  }

  saveAddress() {
    // Validate state and city
    if (!this.selectedStateId || !this.selectedCityId) {
      this.showLocationError = true;
      this.formError.set('Please select both State and City');
      return;
    }

    // Check overall form validity
    if (this.addressForm.invalid ||
        this.emailValidationStatus() !== 'valid' ||
        this.phoneValidationStatus() !== 'valid' ||
        this.zipcodeValidationStatus() !== 'valid') {
      this.formError.set('Please fill all fields with valid data');
      return;
    }

    this.isLoading.set(true);
    this.formError.set('');

    // Simulate API call
    setTimeout(() => {
      const formData = {
        ...this.addressForm.value,
        stateId: this.selectedStateId,
        cityId: this.selectedCityId
      };

      console.log('Address saved:', formData);
      this.successMessage.set('✓ Address saved successfully!');
      this.isLoading.set(false);

      // Clear success message after 3 seconds
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 1500);
  }

  clearForm() {
    this.addressForm.reset({ country: 'India' });
    this.selectedStateId = null;
    this.selectedCityId = null;
    this.emailValidationStatus.set('pending');
    this.phoneValidationStatus.set('pending');
    this.zipcodeValidationStatus.set('pending');
    this.formError.set('');
    this.successMessage.set('');
    this.showLocationError = false;
  }
}
