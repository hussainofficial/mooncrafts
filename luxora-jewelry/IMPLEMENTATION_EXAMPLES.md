# 📝 Implementation Examples

## Example 1: Registration Form

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StateCitySelectComponent } from './shared/components/state-city-select.component';
import { ValidationService } from './core/services/validation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StateCitySelectComponent],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Create Account</h2>

      <form [formGroup]="form" (ngSubmit)="register()">
        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Email *</label>
          <input
            type="email"
            formControlName="email"
            [ngClass]="{
              'border-green-500': isFieldValid('email'),
              'border-red-500': isFieldInvalid('email'),
              'border-gray-300': !isFieldTouched('email')
            }"
            class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none">
          <p *ngIf="isFieldValid('email')" class="text-green-600 text-xs mt-1">✓ Email valid</p>
          <p *ngIf="isFieldInvalid('email')" class="text-red-600 text-xs mt-1">
            {{ validationService.getErrorMessage('Email', getFieldErrors('email')) }}
          </p>
        </div>

        <!-- Phone -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Phone *</label>
          <input
            type="tel"
            formControlName="phone"
            [ngClass]="{
              'border-green-500': isFieldValid('phone'),
              'border-red-500': isFieldInvalid('phone'),
              'border-gray-300': !isFieldTouched('phone')
            }"
            class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none">
          <p *ngIf="isFieldValid('phone')" class="text-green-600 text-xs mt-1">✓ Phone valid</p>
          <p *ngIf="isFieldInvalid('phone')" class="text-red-600 text-xs mt-1">
            {{ validationService.getErrorMessage('Phone', getFieldErrors('phone')) }}
          </p>
        </div>

        <!-- State & City -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Location *</label>
          <app-state-city-select
            [selectedStateId]="form.get('stateId')?.value"
            [selectedCityId]="form.get('cityId')?.value"
            (stateSelected)="form.patchValue({stateId: $event})"
            (citySelected)="form.patchValue({cityId: $event})"
            [showError]="submitted && !form.get('stateId')?.value">
          </app-state-city-select>
        </div>

        <!-- Register Button -->
        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
          Create Account
        </button>
      </form>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  public validationService = inject(ValidationService);
  
  form = this.fb.group({
    email: ['', [Validators.required, this.validationService.emailValidator()]],
    phone: ['', [Validators.required, this.validationService.phoneValidator()]],
    stateId: ['', Validators.required],
    cityId: ['', Validators.required]
  });

  submitted = false;

  register() {
    this.submitted = true;
    if (this.form.valid) {
      console.log('Register:', this.form.value);
      // Call registration API
    }
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.valid && field.touched : false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  isFieldTouched(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.touched : false;
  }

  getFieldErrors(fieldName: string) {
    return this.form.get(fieldName)?.errors || null;
  }
}
```

---

## Example 2: Address Book

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateCitySelectComponent } from './shared/components/state-city-select.component';
import { ValidationService } from './core/services/validation.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface Address {
  id: number;
  name: string;
  email: string;
  phone: string;
  stateId: number;
  cityId: number;
  zipcode: string;
}

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StateCitySelectComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">My Addresses</h2>

      <!-- Add New Address Button -->
      <button
        *ngIf="!isAddingNew"
        (click)="startAddNew()"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg mb-6">
        + Add New Address
      </button>

      <!-- Add/Edit Form -->
      <div *ngIf="isAddingNew || isEditing" class="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit Address' : 'Add New Address' }}</h3>

        <!-- Form Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              [(ngModel)]="currentAddress.email"
              (blur)="validateEmail()"
              class="w-full px-3 py-2 border rounded-lg">
            <p *ngIf="emailError" class="text-red-600 text-xs mt-1">{{ emailError }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              [(ngModel)]="currentAddress.phone"
              (blur)="validatePhone()"
              class="w-full px-3 py-2 border rounded-lg">
            <p *ngIf="phoneError" class="text-red-600 text-xs mt-1">{{ phoneError }}</p>
          </div>
        </div>

        <!-- State & City -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Location</label>
          <app-state-city-select
            #stateCity
            [selectedStateId]="currentAddress.stateId"
            [selectedCityId]="currentAddress.cityId"
            (stateSelected)="currentAddress.stateId = $event"
            (citySelected)="currentAddress.cityId = $event">
          </app-state-city-select>
        </div>

        <!-- Zipcode -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Zipcode</label>
          <input
            type="text"
            [(ngModel)]="currentAddress.zipcode"
            (blur)="validateZipcode()"
            maxlength="6"
            placeholder="400001"
            class="w-full px-3 py-2 border rounded-lg">
          <p *ngIf="zipcodeError" class="text-red-600 text-xs mt-1">{{ zipcodeError }}</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4">
          <button
            (click)="saveAddress()"
            class="bg-green-500 text-white px-4 py-2 rounded-lg">
            Save
          </button>
          <button
            (click)="cancelEdit()"
            class="bg-gray-500 text-white px-4 py-2 rounded-lg">
            Cancel
          </button>
        </div>
      </div>

      <!-- Addresses List -->
      <div class="space-y-4">
        <div *ngFor="let addr of addresses" class="border rounded-lg p-4 bg-white">
          <h4 class="font-semibold">{{ addr.name }}</h4>
          <p class="text-sm text-gray-600">{{ addr.email }}</p>
          <p class="text-sm text-gray-600">{{ addr.phone }}</p>
          <p class="text-sm text-gray-600">Zipcode: {{ addr.zipcode }}</p>

          <div class="flex gap-2 mt-4">
            <button
              (click)="editAddress(addr)"
              class="text-blue-500 hover:underline">
              Edit
            </button>
            <button
              (click)="deleteAddress(addr.id)"
              class="text-red-500 hover:underline">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AddressBookComponent implements OnInit {
  private fb = inject(FormBuilder);
  public validationService = inject(ValidationService);

  addresses: Address[] = [];
  currentAddress: Partial<Address> = {};
  isAddingNew = false;
  isEditing = false;

  emailError = '';
  phoneError = '';
  zipcodeError = '';

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    // Load from API or storage
    this.addresses = [
      {
        id: 1,
        name: 'Home',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        stateId: 14,
        cityId: 1,
        zipcode: '400001'
      }
    ];
  }

  startAddNew() {
    this.currentAddress = { stateId: null, cityId: null };
    this.isAddingNew = true;
    this.isEditing = false;
    this.clearErrors();
  }

  editAddress(addr: Address) {
    this.currentAddress = { ...addr };
    this.isAddingNew = false;
    this.isEditing = true;
    this.clearErrors();
  }

  saveAddress() {
    this.validateAll();

    if (this.emailError || this.phoneError || this.zipcodeError) {
      return;
    }

    if (this.isEditing) {
      // Update address
      const index = this.addresses.findIndex(a => a.id === this.currentAddress.id);
      if (index >= 0) {
        this.addresses[index] = this.currentAddress as Address;
      }
    } else {
      // Add new address
      const newAddress = {
        id: Date.now(),
        name: this.currentAddress.name || 'Address',
        ...this.currentAddress
      } as Address;
      this.addresses.push(newAddress);
    }

    this.cancelEdit();
  }

  cancelEdit() {
    this.currentAddress = {};
    this.isAddingNew = false;
    this.isEditing = false;
    this.clearErrors();
  }

  deleteAddress(id: number) {
    this.addresses = this.addresses.filter(a => a.id !== id);
  }

  validateEmail() {
    const email = (this.currentAddress.email || '').toString();
    this.emailError = email && !this.validationService.isValidEmail(email)
      ? 'Invalid email format'
      : '';
  }

  validatePhone() {
    const phone = (this.currentAddress.phone || '').toString();
    this.phoneError = phone && !this.validationService.isValidPhone(phone)
      ? 'Phone must be 10+ digits'
      : '';
  }

  validateZipcode() {
    const zipcode = (this.currentAddress.zipcode || '').toString();
    this.zipcodeError = zipcode && !this.validationService.isValidZipcode(zipcode)
      ? 'Zipcode must be exactly 6 digits'
      : '';
  }

  validateAll() {
    this.validateEmail();
    this.validatePhone();
    this.validateZipcode();
  }

  clearErrors() {
    this.emailError = '';
    this.phoneError = '';
    this.zipcodeError = '';
  }
}
```

---

## Example 3: Checkout with Complete Form

```typescript
import { Component } from '@angular/core';
import { CheckoutFormCompleteComponent } from './shared/components/checkout-form-complete.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CheckoutFormCompleteComponent],
  template: `
    <div class="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Checkout Form (2/3 width) -->
      <div class="lg:col-span-2">
        <app-checkout-form-complete></app-checkout-form-complete>
      </div>

      <!-- Right: Order Summary (1/3 width) -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold mb-4">Order Summary</h3>
        
        <div class="space-y-2 mb-4 text-sm">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>₹2,000</span>
          </div>
          <div class="flex justify-between">
            <span>Shipping:</span>
            <span>₹100</span>
          </div>
          <div class="flex justify-between">
            <span>Tax:</span>
            <span>₹210</span>
          </div>
        </div>

        <div class="border-t pt-4 font-bold text-lg">
          <div class="flex justify-between">
            <span>Total:</span>
            <span>₹2,310</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent {}
```

---

## Example 4: User Profile Edit

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateCitySelectComponent } from './shared/components/state-city-select.component';
import { ValidationService } from './core/services/validation.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, StateCitySelectComponent],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Edit Profile</h2>

      <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            formControlName="email"
            class="w-full px-4 py-2 border rounded-lg">
        </div>

        <!-- Phone -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Phone</label>
          <input
            type="tel"
            formControlName="phone"
            class="w-full px-4 py-2 border rounded-lg">
        </div>

        <!-- State & City -->
        <div class="mb-4">
          <app-state-city-select
            [selectedStateId]="profileForm.get('stateId')?.value"
            [selectedCityId]="profileForm.get('cityId')?.value"
            (stateSelected)="profileForm.patchValue({stateId: $event})"
            (citySelected)="profileForm.patchValue({cityId: $event})">
          </app-state-city-select>
        </div>

        <!-- Zipcode -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Zipcode</label>
          <input
            type="text"
            formControlName="zipcode"
            maxlength="6"
            class="w-full px-4 py-2 border rounded-lg">
        </div>

        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-lg font-bold">
          Save Changes
        </button>
      </form>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  public validationService = inject(ValidationService);

  profileForm = this.fb.group({
    email: ['', [Validators.required, this.validationService.emailValidator()]],
    phone: ['', [Validators.required, this.validationService.phoneValidator()]],
    stateId: ['', Validators.required],
    cityId: ['', Validators.required],
    zipcode: ['', [Validators.required, this.validationService.zipcodeValidator()]]
  });

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Load from API
    const userData = {
      email: 'john@example.com',
      phone: '+91 98765 43210',
      stateId: 14,
      cityId: 1,
      zipcode: '400001'
    };

    this.profileForm.patchValue(userData);
  }

  saveProfile() {
    if (this.profileForm.valid) {
      console.log('Profile saved:', this.profileForm.value);
      // Call API to save
    }
  }
}
```

---

## Example 5: Form with All Validations

```typescript
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateCitySelectComponent } from './shared/components/state-city-select.component';
import { ValidationService } from './core/services/validation.service';

@Component({
  selector: 'app-comprehensive-form',
  standalone: true,
  imports: [ReactiveFormsModule, StateCitySelectComponent],
  template: `
    <form [formGroup]="form">
      <!-- Email with Full Validation -->
      <div>
        <input formControlName="email" type="email">
        <span *ngIf="isFieldValid('email')" class="text-green-600">✓ Valid</span>
        <span *ngIf="isFieldInvalid('email')" class="text-red-600">✗ Invalid</span>
      </div>

      <!-- Phone with Full Validation -->
      <div>
        <input formControlName="phone" type="tel">
        <span *ngIf="isFieldValid('phone')" class="text-green-600">✓ Valid</span>
        <span *ngIf="isFieldInvalid('phone')" class="text-red-600">✗ Invalid</span>
      </div>

      <!-- Zipcode with Full Validation -->
      <div>
        <input formControlName="zipcode" type="text" maxlength="6">
        <span *ngIf="isFieldValid('zipcode')" class="text-green-600">✓ Valid</span>
        <span *ngIf="isFieldInvalid('zipcode')" class="text-red-600">✗ Invalid</span>
      </div>

      <!-- State/City Selection -->
      <app-state-city-select
        [selectedStateId]="form.get('stateId')?.value"
        [selectedCityId]="form.get('cityId')?.value"
        (stateSelected)="form.patchValue({stateId: $event})"
        (citySelected)="form.patchValue({cityId: $event})">
      </app-state-city-select>

      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class ComprehensiveFormComponent {
  form = this.fb.group({
    email: ['', [Validators.required, this.validationService.emailValidator()]],
    phone: ['', [Validators.required, this.validationService.phoneValidator()]],
    zipcode: ['', [Validators.required, this.validationService.zipcodeValidator()]],
    stateId: ['', Validators.required],
    cityId: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    public validationService: ValidationService
  ) {}

  isFieldValid(field: string): boolean {
    const control = this.form.get(field);
    return control ? control.valid && control.touched : false;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return control ? control.invalid && control.touched : false;
  }
}
```

---

**Copy & paste these examples to get started immediately!** 🚀
