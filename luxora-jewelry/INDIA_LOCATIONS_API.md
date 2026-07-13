# 🇮🇳 India Locations API - Complete Guide

## Overview

This API provides a complete list of Indian states and cities. Perfect for:
- Address forms
- Checkout pages
- User profiles
- Shipping address selection
- Any location-based features

---

## 📦 Backend Setup

### Files Created

```
✅ src/data/india-locations.json          (36 states + cities)
✅ src/controllers/location.controller.js (API logic)
✅ src/routes/location.routes.js          (Routes)
✅ Updated: src/app.js                    (Added routes)
```

### Data Included

- **36 States/Union Territories**
  - All Indian states
  - Union territories
  - State codes for easy reference

- **City List**
  - 250+ major cities
  - Organized by state
  - Ready for dropdown/search

---

## 🚀 API Endpoints

### 1. Get All States

```
GET /api/v1/locations/states

Response 200:
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": 1,
      "name": "Andhra Pradesh",
      "code": "AP"
    },
    {
      "id": 2,
      "name": "Arunachal Pradesh",
      "code": "AR"
    },
    ...
  ],
  "total": 36
}
```

**Use Case:**
```typescript
// In your component
const states = locationService.getStates();

// In template
<select>
  <option *ngFor="let state of states" [value]="state.code">
    {{ state.name }}
  </option>
</select>
```

---

### 2. Get Cities by State

```
GET /api/v1/locations/cities/:stateCode

Example: /api/v1/locations/cities/MH

Response 200:
{
  "success": true,
  "message": "Operation successful",
  "data": [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Aurangabad",
    "Nashik",
    "Kolhapur"
  ],
  "total": 7,
  "stateCode": "MH"
}
```

**Use Case:**
```typescript
// Get cities when state changes
onStateChange(stateCode: string) {
  this.locationService.getCitiesByState(stateCode).subscribe(response => {
    this.cities = response.data;
  });
}
```

---

### 3. Get All Cities

```
GET /api/v1/locations/cities

Response 200:
{
  "success": true,
  "message": "Operation successful",
  "data": [
    "Agartala",
    "Agra",
    "Ahmednagar",
    "Ahmedabad",
    ...
  ],
  "total": 250+
}
```

**Use Case:**
```typescript
// For autocomplete or search
const allCities = await locationService.getAllCities();
```

---

### 4. Search Cities

```
GET /api/v1/locations/search?query=mum

Response 200:
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "city": "Mumbai",
      "state": "Maharashtra",
      "stateCode": "MH"
    },
    {
      "city": "Mumbra",
      "state": "Maharashtra",
      "stateCode": "MH"
    }
  ],
  "total": 2
}
```

**Use Case:**
```typescript
// Real-time search
searchCities(query: string) {
  this.locationService.searchCities(query).then(results => {
    this.suggestions = results;
  });
}
```

---

## 🔌 Frontend Integration

### 1. Simple Dropdown Form

```typescript
import { LocationService } from './location.service';

@Component({...})
export class AddressFormComponent {
  states$ = this.location.getStates();
  cities: string[] = [];

  constructor(private location: LocationService) {}

  onStateChange(stateCode: string) {
    this.location.getCitiesByState(stateCode).subscribe(response => {
      this.cities = response.data;
    });
  }
}
```

**Template:**
```html
<!-- State Dropdown -->
<select (change)="onStateChange($event.target.value)">
  <option>-- Select State --</option>
  <option *ngFor="let state of states" [value]="state.code">
    {{ state.name }}
  </option>
</select>

<!-- City Dropdown -->
<select>
  <option>-- Select City --</option>
  <option *ngFor="let city of cities" [value]="city">
    {{ city }}
  </option>
</select>
```

---

### 2. With Search/Autocomplete

```typescript
import { LocationService } from './location.service';

@Component({...})
export class LocationSearchComponent {
  searchQuery = '';
  searchResults: any[] = [];

  constructor(private location: LocationService) {}

  async onSearch(query: string) {
    if (query.length >= 2) {
      this.searchResults = await this.location.searchCities(query);
    }
  }

  selectCity(result: any) {
    console.log(`Selected: ${result.city}, ${result.state}`);
  }
}
```

**Template:**
```html
<input
  type="text"
  [(ngModel)]="searchQuery"
  (input)="onSearch(searchQuery)"
  placeholder="Search city...">

<div *ngFor="let result of searchResults" (click)="selectCity(result)">
  <strong>{{ result.city }}</strong>
  <span>({{ result.state }})</span>
</div>
```

---

### 3. Complete Address Form Component

The `address-form.component.ts` is a fully functional example with:
- State dropdown
- City dropdown (auto-populates)
- City search option
- All validation
- Error handling
- Loading states

**Usage:**
```html
<app-address-form></app-address-form>
```

---

## 📋 State Codes Reference

| Code | State |
|------|-------|
| AP | Andhra Pradesh |
| AR | Arunachal Pradesh |
| AS | Assam |
| BR | Bihar |
| CT | Chhattisgarh |
| GA | Goa |
| GJ | Gujarat |
| HR | Haryana |
| HP | Himachal Pradesh |
| JH | Jharkhand |
| KA | Karnataka |
| KL | Kerala |
| MP | Madhya Pradesh |
| MH | Maharashtra |
| MN | Manipur |
| ML | Meghalaya |
| MZ | Mizoram |
| NL | Nagaland |
| OD | Odisha |
| PB | Punjab |
| RJ | Rajasthan |
| SK | Sikkim |
| TN | Tamil Nadu |
| TG | Telangana |
| TR | Tripura |
| UP | Uttar Pradesh |
| UK | Uttarakhand |
| WB | West Bengal |
| AN | Andaman and Nicobar Islands |
| CH | Chandigarh |
| DN | Dadra and Nagar Haveli and Daman and Diu |
| LD | Lakshadweep |
| DL | Delhi |
| PY | Puducherry |
| LA | Ladakh |
| JK | Jammu and Kashmir |

---

## 🧪 Testing with Postman

### Test 1: Get All States
```
GET http://localhost:5000/api/v1/locations/states
```

### Test 2: Get Cities by State
```
GET http://localhost:5000/api/v1/locations/cities/MH
```

### Test 3: Search Cities
```
GET http://localhost:5000/api/v1/locations/search?query=mumbai
```

---

## 💡 Use Cases

### 1. Checkout Address Form
```typescript
<app-address-form></app-address-form>
```

### 2. User Profile Edit
```typescript
<select>
  <option *ngFor="let state of locationService.getStates()" [value]="state.code">
    {{ state.name }}
  </option>
</select>
```

### 3. Shipping Address Selection
```typescript
// Show state dropdown
// Auto-load cities for selected state
// Let user pick city
```

### 4. Search-based Location Picker
```typescript
<input (input)="searchCities($event)" placeholder="Search...">
<div *ngFor="let result of searchResults">
  {{ result.city }}, {{ result.state }}
</div>
```

---

## 🔒 Performance Notes

### Caching
- States are loaded once on service init
- Cities can be cached per state
- Search results are fresh each time

### Optimization
- Use state codes (AP, MH) instead of full names for storage
- Lazy-load cities only when needed
- Cache results client-side if searching frequently

---

## 🚨 Important: Update Backend

Before testing, make sure you've:

1. ✅ Created `src/data/india-locations.json`
2. ✅ Created location controller
3. ✅ Created location routes
4. ✅ Updated `src/app.js` with routes
5. ✅ Restarted backend server

```powershell
cd C:\Users\hussa\luxora-backend
npm run dev
```

---

## 📝 Example: Complete Checkout with Addresses

```typescript
@Component({
  selector: 'app-checkout',
  imports: [AddressFormComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Checkout</h1>

      <!-- Cart Summary -->
      <div class="mb-8 p-4 bg-gray-50 rounded">
        <h2 class="font-bold mb-4">Order Summary</h2>
        <!-- Cart items here -->
      </div>

      <!-- Shipping Address -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">Shipping Address</h2>
        <app-address-form></app-address-form>
      </div>

      <!-- Billing Address -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">Billing Address</h2>
        <app-address-form></app-address-form>
      </div>

      <!-- Payment -->
      <button class="bg-rose-500 text-white px-8 py-3 rounded-lg font-bold">
        Place Order
      </button>
    </div>
  `
})
export class CheckoutComponent {}
```

---

## ✨ What's Included

✅ 36 States/Union Territories
✅ 250+ Cities
✅ Real-time search
✅ Dropdown support
✅ Autocomplete ready
✅ Error handling
✅ Loading states
✅ Complete example component

---

## 🎯 Next Steps

1. **Test API endpoints** in Postman
2. **Integrate AddressFormComponent** in checkout/profile pages
3. **Customize styling** to match your theme
4. **Add validation** as needed
5. **Cache results** if required

---

**All Set!** Your location API is ready to use. 🚀
