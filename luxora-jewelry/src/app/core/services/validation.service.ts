import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  // Email validation
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(control.value);

      return isValid ? null : { invalidEmail: true };
    };
  }

  // Phone validation - India format
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      // Allows: +91 9876543210, 9876543210, +1-800-123-4567, etc.
      const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
      const isValid = phoneRegex.test(control.value) && control.value.replace(/\D/g, '').length >= 10;

      return isValid ? null : { invalidPhone: true };
    };
  }

  // Zipcode/Postal Code validation - India format
  zipcodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      // India postal codes are 6 digits
      const zipcodeRegex = /^[0-9]{6}$/;
      const isValid = zipcodeRegex.test(value);

      return isValid ? null : { invalidZipcode: true };
    };
  }

  // Indian phone number only (10 digits after country code)
  indianPhoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      // Remove non-digit characters
      const digitsOnly = value.replace(/\D/g, '');

      // Check if it's valid Indian number (10 digits for local, 12 for +91)
      const isValid =
        (digitsOnly.length === 10) ||  // 10 digits without country code
        (digitsOnly.length === 12 && digitsOnly.startsWith('91')); // 12 digits with +91

      return isValid ? null : { invalidIndianPhone: true };
    };
  }

  // Get error message for validation
  getErrorMessage(fieldName: string, errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return `${fieldName} is required`;
    }

    if (errors['invalidEmail']) {
      return 'Please enter a valid email (example@email.com)';
    }

    if (errors['invalidPhone']) {
      return 'Phone must be 10+ digits (can include +, -, spaces)';
    }

    if (errors['invalidZipcode']) {
      return 'Zipcode must be exactly 6 digits';
    }

    if (errors['invalidIndianPhone']) {
      return 'Phone must be 10 digits or +91 followed by 10 digits';
    }

    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `${fieldName} must be at least ${minLength} characters`;
    }

    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `${fieldName} must be at most ${maxLength} characters`;
    }

    return 'Invalid input';
  }

  // Format phone number to Indian format
  formatPhoneNumber(phone: string): string {
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length === 10) {
      return `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
    }

    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      return `+91 ${digitsOnly.slice(2, 7)} ${digitsOnly.slice(7)}`;
    }

    return phone;
  }

  // Validate zipcode format
  isValidZipcode(zipcode: string): boolean {
    const zipcodeRegex = /^[0-9]{6}$/;
    return zipcodeRegex.test(zipcode?.toString().trim() || '');
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone format
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  // Validate name format
  isValidName(name: string): boolean {
    if (!name || name.trim().length < 3) {
      return false;
    }
    if (name.length > 100) {
      return false;
    }
    // Check if contains numbers
    if (/\d/.test(name)) {
      return false;
    }
    return true;
  }

  // Validate all checkout details together
  validateCheckoutDetails(email: string, name: string, phone: string): { valid: boolean; errors: { [key: string]: string } } {
    const errors: { [key: string]: string } = {};

    if (!email || !this.isValidEmail(email)) {
      errors['email'] = email ? 'Invalid email format (example@email.com)' : 'Email is required';
    }

    if (!name || !this.isValidName(name)) {
      if (!name) {
        errors['name'] = 'Name is required';
      } else if (name.trim().length < 3) {
        errors['name'] = 'Name must be at least 3 characters';
      } else if (name.length > 100) {
        errors['name'] = 'Name must not exceed 100 characters';
      } else if (/\d/.test(name)) {
        errors['name'] = 'Name should not contain numbers';
      }
    }

    if (!phone || !this.isValidPhone(phone)) {
      errors['phone'] = phone ? 'Phone must be 10+ digits' : 'Phone number is required';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}
