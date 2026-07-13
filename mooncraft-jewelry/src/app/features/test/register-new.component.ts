import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ValidationService } from '../../core/services/validation.service';
import { StateCitySelectComponent } from '../../shared/components/state-city-select.component';

@Component({
  selector: 'app-register-new',
  standalone: true,
  imports: [CommonModule, FormsModule, StateCitySelectComponent],
  template: `
    <div class="min-h-screen bg-pink-50 p-8">
      <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-rose-500 mb-8">NEW REGISTER FORM</h1>

        <!-- EMAIL VALIDATION TEST -->
        <div class="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 class="text-xl font-bold mb-4">✉️ EMAIL VALIDATION TEST</h2>
          <label class="block text-sm font-semibold mb-2">
            Email *
            <span *ngIf="emailValidationStatus() === 'valid'" class="text-green-600">✅</span>
            <span *ngIf="emailValidationStatus() === 'invalid'" class="text-red-600">❌</span>
          </label>
          <input
            [(ngModel)]="testEmail"
            (input)="validateEmail()"
            (blur)="validateEmail()"
            placeholder="Type email here..."
            [ngClass]="{
              'border-4 border-green-500 bg-green-50': emailValidationStatus() === 'valid',
              'border-4 border-red-500 bg-red-50': emailValidationStatus() === 'invalid',
              'border-2 border-gray-300': emailValidationStatus() === 'pending'
            }"
            class="w-full px-4 py-3 rounded-lg focus:outline-none transition text-lg font-bold">
          <p *ngIf="emailValidationStatus() === 'valid'" class="text-green-600 font-bold mt-2">✅ VALID EMAIL!</p>
          <p *ngIf="emailValidationStatus() === 'invalid'" class="text-red-600 font-bold mt-2">❌ INVALID EMAIL!</p>
          <p *ngIf="emailValidationStatus() === 'pending'" class="text-gray-600 mt-2">Type to validate...</p>
        </div>

        <!-- PHONE VALIDATION TEST -->
        <div class="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 class="text-xl font-bold mb-4">📱 PHONE VALIDATION TEST</h2>
          <label class="block text-sm font-semibold mb-2">
            Phone *
            <span *ngIf="phoneValidationStatus() === 'valid'" class="text-green-600">✅</span>
            <span *ngIf="phoneValidationStatus() === 'invalid'" class="text-red-600">❌</span>
          </label>
          <input
            [(ngModel)]="testPhone"
            (input)="validatePhone()"
            (blur)="validatePhone()"
            placeholder="Type phone here..."
            [ngClass]="{
              'border-4 border-green-500 bg-green-50': phoneValidationStatus() === 'valid',
              'border-4 border-red-500 bg-red-50': phoneValidationStatus() === 'invalid',
              'border-2 border-gray-300': phoneValidationStatus() === 'pending'
            }"
            class="w-full px-4 py-3 rounded-lg focus:outline-none transition text-lg font-bold">
          <p class="text-gray-600 mt-2">Character count: {{ testPhone.length }}/20</p>
          <p *ngIf="phoneValidationStatus() === 'valid'" class="text-green-600 font-bold mt-2">✅ VALID PHONE!</p>
          <p *ngIf="phoneValidationStatus() === 'invalid'" class="text-red-600 font-bold mt-2">❌ INVALID PHONE!</p>
        </div>

        <!-- ZIPCODE VALIDATION TEST -->
        <div class="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 class="text-xl font-bold mb-4">🔢 ZIPCODE VALIDATION TEST</h2>
          <label class="block text-sm font-semibold mb-2">
            Zipcode *
            <span *ngIf="zipcodeValidationStatus() === 'valid'" class="text-green-600">✅</span>
            <span *ngIf="zipcodeValidationStatus() === 'invalid'" class="text-red-600">❌</span>
          </label>
          <input
            [(ngModel)]="testZipcode"
            (input)="validateZipcode()"
            (blur)="validateZipcode()"
            placeholder="Type zipcode here..."
            maxlength="6"
            [ngClass]="{
              'border-4 border-green-500 bg-green-50': zipcodeValidationStatus() === 'valid',
              'border-4 border-red-500 bg-red-50': zipcodeValidationStatus() === 'invalid',
              'border-2 border-gray-300': zipcodeValidationStatus() === 'pending'
            }"
            class="w-full px-4 py-3 rounded-lg focus:outline-none transition text-lg font-bold">
          <p class="text-gray-600 mt-2">Character count: {{ testZipcode.length }}/6</p>
          <p *ngIf="zipcodeValidationStatus() === 'valid'" class="text-green-600 font-bold mt-2">✅ VALID ZIPCODE!</p>
          <p *ngIf="zipcodeValidationStatus() === 'invalid'" class="text-red-600 font-bold mt-2">❌ INVALID ZIPCODE!</p>
        </div>

        <!-- STATE & CITY TEST -->
        <div class="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 class="text-xl font-bold mb-4">🗺️ STATE & CITY DROPDOWN TEST</h2>
          <app-state-city-select
            [selectedStateId]="selectedStateId"
            [selectedCityId]="selectedCityId"
            (stateSelected)="selectedStateId = $event"
            (citySelected)="selectedCityId = $event">
          </app-state-city-select>
          <p class="mt-4 text-lg font-bold">Selected: State ID={{ selectedStateId }}, City ID={{ selectedCityId }}</p>
        </div>

      </div>
    </div>
  `,
})
export class RegisterNewComponent {
  private validationService = inject(ValidationService);

  testEmail = '';
  testPhone = '';
  testZipcode = '';
  selectedStateId: number | null = null;
  selectedCityId: number | null = null;

  emailValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  phoneValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  zipcodeValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');

  validateEmail() {
    if (!this.testEmail) {
      this.emailValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidEmail(this.testEmail);
    this.emailValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validatePhone() {
    if (!this.testPhone) {
      this.phoneValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidPhone(this.testPhone);
    this.phoneValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validateZipcode() {
    if (!this.testZipcode) {
      this.zipcodeValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidZipcode(this.testZipcode);
    this.zipcodeValidationStatus.set(isValid ? 'valid' : 'invalid');
  }
}
