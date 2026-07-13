# 🇮🇳 India Locations API - Quick Start

## ✅ What's Created

```
Backend:
  ✅ src/data/india-locations.json          (36 states + 250+ cities)
  ✅ src/controllers/location.controller.js (4 API endpoints)
  ✅ src/routes/location.routes.js
  ✅ Updated: src/app.js

Frontend:
  ✅ src/core/services/location.service.ts  (Service to consume API)
  ✅ src/shared/components/address-form.component.ts  (Full example)
```

---

## 🚀 API Endpoints

```
GET  /api/v1/locations/states              → All states
GET  /api/v1/locations/cities/:stateCode   → Cities by state
GET  /api/v1/locations/cities              → All cities
GET  /api/v1/locations/search?query=mum    → Search cities
```

---

## 📱 Quick Usage

### 1. In Component
```typescript
import { LocationService } from './location.service';

export class MyComponent {
  constructor(public location: LocationService) {}

  // Get states
  states = this.location.getStates();

  // Get cities for state
  onStateChange(code: string) {
    this.location.getCitiesByState(code).subscribe(res => {
      this.cities = res.data;
    });
  }

  // Search cities
  async searchCities(query: string) {
    const results = await this.location.searchCities(query);
  }
}
```

### 2. In Template
```html
<!-- State Dropdown -->
<select (change)="onStateChange($event.target.value)">
  <option>Select State</option>
  <option *ngFor="let state of states" [value]="state.code">
    {{ state.name }}
  </option>
</select>

<!-- City Dropdown -->
<select>
  <option *ngFor="let city of cities" [value]="city">
    {{ city }}
  </option>
</select>
```

### 3. Complete Form
```html
<app-address-form></app-address-form>
```

---

## 🧪 Test in Postman

```
GET http://localhost:5000/api/v1/locations/states
GET http://localhost:5000/api/v1/locations/cities/MH
GET http://localhost:5000/api/v1/locations/search?query=mumbai
```

---

## 💡 Popular States (Code Reference)

| Code | State |
|------|-------|
| DL | Delhi |
| MH | Maharashtra |
| KA | Karnataka |
| TN | Tamil Nadu |
| GJ | Gujarat |
| UP | Uttar Pradesh |
| RJ | Rajasthan |
| WB | West Bengal |

---

## ⚡ Real-World Example

**Checkout Form with Address:**

```typescript
@Component({
  selector: 'app-checkout',
  imports: [AddressFormComponent, CommonModule],
  template: `
    <div class="container mx-auto p-8">
      <h1 class="text-3xl font-bold mb-8">Complete Your Order</h1>

      <!-- Shipping Address -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">Shipping Address</h2>
        <app-address-form></app-address-form>
      </div>

      <!-- Billing Address (Optional) -->
      <label class="flex items-center gap-2 mb-6">
        <input type="checkbox" [(ngModel)]="sameAsBilling">
        <span>Billing address same as shipping</span>
      </label>

      <div *ngIf="!sameAsBilling" class="mb-8">
        <h2 class="text-xl font-bold mb-4">Billing Address</h2>
        <app-address-form></app-address-form>
      </div>

      <!-- Payment & Review -->
      <div class="border-t pt-8">
        <h2 class="text-xl font-bold mb-4">Review Your Order</h2>
        <!-- Payment details here -->
        <button class="bg-rose-500 text-white px-8 py-3 rounded-lg font-bold">
          Place Order
        </button>
      </div>
    </div>
  `
})
export class CheckoutComponent {
  sameAsBilling = true;
}
```

---

## 🎯 When to Use Each Endpoint

| Endpoint | Use Case |
|----------|----------|
| `/states` | Load state dropdown |
| `/cities/:code` | When user selects state |
| `/cities` | For search across all cities |
| `/search` | Real-time autocomplete |

---

## 🔄 Complete Flow

```
1. Component loads
   ↓
2. Get all states (service caches them)
   ↓
3. Show state dropdown
   ↓
4. User selects state
   ↓
5. Get cities for that state
   ↓
6. Show city dropdown
   ↓
7. User selects city
   ↓
8. Save address (with state + city)
```

---

## 📊 Data Structure

### State
```json
{
  "id": 14,
  "name": "Maharashtra",
  "code": "MH"
}
```

### City List for State
```json
["Mumbai", "Pune", "Nagpur", "Thane", "Aurangabad"]
```

### Search Result
```json
{
  "city": "Mumbai",
  "state": "Maharashtra",
  "stateCode": "MH"
}
```

---

## 🎨 Styling Tips

```typescript
// Make it match your theme (#fde9f3 background)
const selectClasses = `
  w-full px-4 py-2
  border border-gray-300 rounded-lg
  bg-white text-gray-900
  focus:outline-none focus:ring-2 focus:ring-rose-500
`;
```

---

## ⚠️ Important

1. **Backend must be running**
   ```powershell
   cd C:\Users\hussa\luxora-backend
   npm run dev
   ```

2. **Frontend must have HttpClientModule** (already added)

3. **All 36 states + 250+ cities included** - no need to add manually

---

## 🚀 Deploy to Production

The location data is static, so:
- ✅ No database needed
- ✅ Fast loading (JSON file)
- ✅ Can be cached indefinitely
- ✅ No API key required

---

## 📝 Customization

Need to add more cities?

Edit `src/data/india-locations.json`:
```json
{
  "MH": [
    "Mumbai",
    "Pune",
    "YourNewCity"  // ← Add here
  ]
}
```

Then restart backend.

---

**Ready to use!** 🎉

Next: Integrate AddressFormComponent into your checkout page.
