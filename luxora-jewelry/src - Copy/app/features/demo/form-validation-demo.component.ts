import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '../../core/services/location.service';
import { ValidationService } from '../../core/services/validation.service';
import { StateCitySelectComponent } from '../../shared/components/state-city-select.component';
import { CheckoutFormCompleteComponent } from '../../shared/components/checkout-form-complete.component';

@Component({
  selector: 'app-form-validation-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StateCitySelectComponent,
    CheckoutFormCompleteComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-pink-50 to-white p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">📋 Form Validation Demo</h1>
          <p class="text-gray-600 text-lg">Test email, phone, zipcode validation & state/city dropdowns</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            *ngFor="let tab of tabs"
            (click)="activeTab.set(tab.id)"
            [ngClass]="{
              'bg-rose-500 text-white': activeTab() === tab.id,
              'bg-gray-200 text-gray-700 hover:bg-gray-300': activeTab() !== tab.id
            }"
            class="px-6 py-2 rounded-lg font-semibold transition">
            {{ tab.name }}
          </button>
        </div>

        <!-- Tab 1: Simple Validation Demo -->
        <div *ngIf="activeTab() === 'simple'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-gray-900">✉️ Email Validation</h2>

            <!-- Email Input with Real-time Validation -->
            <div class="mb-8">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                [(ngModel)]="testEmail"
                (blur)="validateTestEmail()"
                (input)="validateTestEmail()"
                type="email"
                placeholder="Type an email..."
                [ngClass]="{
                  'border-4 border-green-500 bg-green-50': emailValidationStatus() === 'valid',
                  'border-4 border-red-500 bg-red-50': emailValidationStatus() === 'invalid',
                  'border-4 border-gray-300': emailValidationStatus() === 'pending'
                }"
                class="w-full px-4 py-3 rounded-lg focus:outline-none transition font-semibold text-lg">

              <!-- Status Indicator -->
              <div class="mt-4">
                <p *ngIf="emailValidationStatus() === 'valid'" class="text-green-600 text-lg font-semibold">
                  ✅ VALID EMAIL - Looks good!
                </p>
                <p *ngIf="emailValidationStatus() === 'invalid'" class="text-red-600 text-lg font-semibold">
                  ❌ INVALID EMAIL - Please enter a valid email format (example@email.com)
                </p>
                <p *ngIf="emailValidationStatus() === 'pending'" class="text-gray-600 text-lg font-semibold">
                  ⏳ PENDING - Type an email to validate
                </p>
              </div>

              <!-- Example Emails -->
              <div class="mt-6 bg-blue-50 p-4 rounded-lg">
                <p class="font-semibold text-blue-900 mb-2">✅ Try these valid emails:</p>
                <div class="space-y-1 text-blue-800">
                  <p>• john@example.com</p>
                  <p>• user.name@company.co.uk</p>
                  <p>• user+tag@example.com</p>
                </div>
              </div>

              <div class="mt-4 bg-red-50 p-4 rounded-lg">
                <p class="font-semibold text-red-900 mb-2">❌ These are invalid:</p>
                <div class="space-y-1 text-red-800">
                  <p>• john@example (missing TLD)</p>
                  <p>• user@@example.com (double @)</p>
                  <p>• example.com (missing @)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Phone Validation Section -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-gray-900">📱 Phone Validation</h2>

            <div class="mb-8">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                [(ngModel)]="testPhone"
                (blur)="validateTestPhone()"
                (input)="validateTestPhone()"
                type="tel"
                placeholder="Type a phone number..."
                [ngClass]="{
                  'border-4 border-green-500 bg-green-50': phoneValidationStatus() === 'valid',
                  'border-4 border-red-500 bg-red-50': phoneValidationStatus() === 'invalid',
                  'border-4 border-gray-300': phoneValidationStatus() === 'pending'
                }"
                class="w-full px-4 py-3 rounded-lg focus:outline-none transition font-semibold text-lg">

              <!-- Character Counter -->
              <div class="mt-4">
                <p class="text-sm text-gray-600 font-semibold">
                  Character Count: <span class="text-lg">{{ testPhone.length }}/20</span>
                </p>
              </div>

              <!-- Status Indicator -->
              <div class="mt-4">
                <p *ngIf="phoneValidationStatus() === 'valid'" class="text-green-600 text-lg font-semibold">
                  ✅ VALID PHONE - Number looks good!
                </p>
                <p *ngIf="phoneValidationStatus() === 'invalid'" class="text-red-600 text-lg font-semibold">
                  ❌ INVALID PHONE - Phone must be 10+ digits (can include +, -, spaces)
                </p>
                <p *ngIf="phoneValidationStatus() === 'pending'" class="text-gray-600 text-lg font-semibold">
                  ⏳ PENDING - Type a phone number to validate
                </p>
              </div>

              <!-- Format Helper -->
              <div class="mt-4 bg-purple-50 p-4 rounded-lg">
                <p class="font-semibold text-purple-900 mb-2">📋 Format Examples:</p>
                <p class="text-purple-800 font-mono">+91 XXXXX XXXXX</p>
                <p class="text-purple-800 font-mono">XXXXXXXXXX (10 digits)</p>
              </div>

              <!-- Example Phones -->
              <div class="mt-4 bg-blue-50 p-4 rounded-lg">
                <p class="font-semibold text-blue-900 mb-2">✅ Try these valid phones:</p>
                <div class="space-y-1 text-blue-800">
                  <p>• +91 98765 43210</p>
                  <p>• 9876543210</p>
                  <p>• +1-800-123-4567</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Zipcode Validation Section -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-6 text-gray-900">🔢 Zipcode Validation</h2>

            <div class="mb-8">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Postal Code / Zipcode</label>
              <input
                [(ngModel)]="testZipcode"
                (blur)="validateTestZipcode()"
                (input)="validateTestZipcode()"
                type="text"
                placeholder="Type a zipcode..."
                maxlength="6"
                [ngClass]="{
                  'border-4 border-green-500 bg-green-50': zipcodeValidationStatus() === 'valid',
                  'border-4 border-red-500 bg-red-50': zipcodeValidationStatus() === 'invalid',
                  'border-4 border-gray-300': zipcodeValidationStatus() === 'pending'
                }"
                class="w-full px-4 py-3 rounded-lg focus:outline-none transition font-semibold text-lg">

              <!-- Character Counter -->
              <div class="mt-4">
                <p class="text-sm text-gray-600 font-semibold">
                  Character Count: <span class="text-lg">{{ testZipcode.length }}/6</span>
                </p>
              </div>

              <!-- Status Indicator -->
              <div class="mt-4">
                <p *ngIf="zipcodeValidationStatus() === 'valid'" class="text-green-600 text-lg font-semibold">
                  ✅ VALID ZIPCODE - Zipcode is valid!
                </p>
                <p *ngIf="zipcodeValidationStatus() === 'invalid'" class="text-red-600 text-lg font-semibold">
                  ❌ INVALID ZIPCODE - Zipcode must be exactly 6 digits
                </p>
                <p *ngIf="zipcodeValidationStatus() === 'pending'" class="text-gray-600 text-lg font-semibold">
                  ⏳ PENDING - Type a zipcode to validate
                </p>
              </div>

              <!-- Format Helper -->
              <div class="mt-4 bg-purple-50 p-4 rounded-lg">
                <p class="font-semibold text-purple-900 mb-2">📋 Format:</p>
                <p class="text-purple-800 font-mono">XXXXXX (exactly 6 digits)</p>
              </div>

              <!-- Example Zipcodes -->
              <div class="mt-4 bg-blue-50 p-4 rounded-lg">
                <p class="font-semibold text-blue-900 mb-2">✅ Try these valid zipcodes:</p>
                <div class="space-y-1 text-blue-800">
                  <p>• 400001 (Mumbai)</p>
                  <p>• 110001 (Delhi)</p>
                  <p>• 560034 (Bangalore)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: State & City Dropdown -->
        <div *ngIf="activeTab() === 'location'" class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">🗺️ State & City Selection</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Left: Dropdown Component -->
            <div>
              <h3 class="text-lg font-bold mb-4 text-gray-800">Select Your Location</h3>
              <app-state-city-select
                [selectedStateId]="selectedStateId"
                [selectedCityId]="selectedCityId"
                (stateSelected)="onStateSelected($event)"
                (citySelected)="onCitySelected($event)"
                stateLabel="State"
                cityLabel="City"
                statePlaceholder="-- Select State --"
                cityPlaceholder="-- Select City --">
              </app-state-city-select>
            </div>

            <!-- Right: Selected Values Display -->
            <div>
              <h3 class="text-lg font-bold mb-4 text-gray-800">📊 Selected Values</h3>
              <div class="bg-blue-50 p-6 rounded-lg">
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-600 font-semibold">State ID:</p>
                    <p class="text-2xl font-bold text-blue-600">
                      {{ selectedStateId || 'Not selected' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 font-semibold">City ID:</p>
                    <p class="text-2xl font-bold text-blue-600">
                      {{ selectedCityId || 'Not selected' }}
                    </p>
                  </div>
                  <div class="bg-white p-4 rounded-lg mt-4">
                    <p class="text-sm text-gray-600 font-semibold mb-2">JSON Output:</p>
                    <pre class="bg-gray-100 p-3 rounded text-xs overflow-auto">{{ getLocationJson() }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Features -->
          <div class="mt-8 bg-green-50 p-6 rounded-lg">
            <h3 class="text-lg font-bold text-green-900 mb-4">✨ Features</h3>
            <ul class="space-y-2 text-green-800">
              <li>✅ Loads all 36 Indian states from database</li>
              <li>✅ Auto-populates cities when state is selected</li>
              <li>✅ Cities are fetched from database via API</li>
              <li>✅ Stores state ID and city ID (not names)</li>
              <li>✅ City dropdown disabled until state selected</li>
              <li>✅ Shows loading state while fetching cities</li>
            </ul>
          </div>
        </div>

        <!-- Tab 3: Complete Form -->
        <div *ngIf="activeTab() === 'complete'" class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">📝 Complete Checkout Form</h2>
          <p class="text-gray-600 mb-6">This form includes all validations: email, phone, zipcode, state/city selection</p>

          <app-checkout-form-complete></app-checkout-form-complete>
        </div>

        <!-- Tab 4: Instructions -->
        <div *ngIf="activeTab() === 'instructions'" class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">📖 How to Use These Components</h2>

          <div class="space-y-6">
            <!-- Option 1 -->
            <div class="border-l-4 border-blue-500 pl-6 py-4">
              <h3 class="text-lg font-bold text-blue-900 mb-2">Option 1: Complete Checkout Form</h3>
              <p class="text-gray-700 mb-3">Use this for checkout pages. Includes everything:</p>
              <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm"><code>&lt;app-checkout-form-complete&gt;&lt;/app-checkout-form-complete&gt;</code></pre>
              <p class="text-gray-600 text-sm mt-3">✅ Email validation ✅ Phone validation ✅ Zipcode validation ✅ State/City dropdowns</p>
            </div>

            <!-- Option 2 -->
            <div class="border-l-4 border-green-500 pl-6 py-4">
              <h3 class="text-lg font-bold text-green-900 mb-2">Option 2: Just State/City Dropdowns</h3>
              <p class="text-gray-700 mb-3">Use this in any form where you need location selection</p>
              <p class="text-sm text-green-800 font-mono bg-gray-100 p-3 rounded">
                Use: app-state-city-select component<br>
                Pass: selectedStateId and selectedCityId<br>
                Listen: (stateSelected) and (citySelected) events
              </p>
            </div>

            <!-- Option 3 -->
            <div class="border-l-4 border-purple-500 pl-6 py-4">
              <h3 class="text-lg font-bold text-purple-900 mb-2">Option 3: Use Validators in Your Forms</h3>
              <p class="text-gray-700 mb-3">Add validation to any form control:</p>
              <p class="text-sm text-purple-800 font-mono bg-gray-100 p-3 rounded">
                emailValidator() from ValidationService<br>
                phoneValidator() from ValidationService<br>
                zipcodeValidator() from ValidationService
              </p>
            </div>
          </div>

          <!-- Validation Rules -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h4 class="font-bold text-blue-900 mb-3">📧 Email Rules</h4>
              <p class="text-sm text-blue-800 mb-2">Pattern: <code>example@email.com</code></p>
              <p class="text-xs text-blue-700">Must include @ and domain extension</p>
            </div>

            <div class="bg-green-50 p-6 rounded-lg">
              <h4 class="font-bold text-green-900 mb-3">📱 Phone Rules</h4>
              <p class="text-sm text-green-800 mb-2">Min: <code>10 digits</code></p>
              <p class="text-xs text-green-700">Can include +, -, spaces, parentheses</p>
            </div>

            <div class="bg-purple-50 p-6 rounded-lg">
              <h4 class="font-bold text-purple-900 mb-3">🔢 Zipcode Rules</h4>
              <p class="text-sm text-purple-800 mb-2">Exactly: <code>6 digits</code></p>
              <p class="text-xs text-purple-700">Indian postal codes only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FormValidationDemoComponent implements OnInit {
  activeTab = signal('simple');

  // Test inputs for simple validation
  testEmail = '';
  testPhone = '';
  testZipcode = '';

  // Validation status signals
  emailValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  phoneValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  zipcodeValidationStatus = signal<'pending' | 'valid' | 'invalid'>('pending');

  // State/City selection
  selectedStateId: number | null = null;
  selectedCityId: number | null = null;

  // Tabs configuration
  tabs = [
    { id: 'simple', name: '✉️ Email, Phone & Zipcode' },
    { id: 'location', name: '🗺️ State & City' },
    { id: 'complete', name: '📝 Complete Form' },
    { id: 'instructions', name: '📖 How to Use' }
  ];

  private validationService = inject(ValidationService);

  validateTestEmail() {
    if (!this.testEmail) {
      this.emailValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidEmail(this.testEmail);
    this.emailValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validateTestPhone() {
    if (!this.testPhone) {
      this.phoneValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidPhone(this.testPhone);
    this.phoneValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  validateTestZipcode() {
    if (!this.testZipcode) {
      this.zipcodeValidationStatus.set('pending');
      return;
    }
    const isValid = this.validationService.isValidZipcode(this.testZipcode);
    this.zipcodeValidationStatus.set(isValid ? 'valid' : 'invalid');
  }

  onStateSelected(stateId: number) {
    this.selectedStateId = stateId;
  }

  onCitySelected(cityId: number) {
    this.selectedCityId = cityId;
  }

  getLocationJson() {
    return JSON.stringify({
      stateId: this.selectedStateId,
      cityId: this.selectedCityId
    }, null, 2);
  }

  ngOnInit() {
    // Demo: Start with simple tab
    this.activeTab.set('simple');
  }
}
