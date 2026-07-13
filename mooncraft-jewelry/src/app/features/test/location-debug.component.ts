import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../core/services/location.service';

@Component({
  selector: 'app-location-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 bg-gray-100 min-h-screen">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-6 text-gray-900">🔍 Location Service Debug</h1>

        <!-- Loaded States -->
        <div class="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-300">
          <h2 class="text-xl font-bold text-blue-900 mb-4">📍 Loaded States</h2>
          <p class="text-blue-800 font-bold mb-3">
            Total States: <span class="text-2xl text-blue-600">{{ getStates().length }}</span>
          </p>

          <div *ngIf="getStates().length === 0" class="p-4 bg-red-100 border border-red-300 rounded text-red-700 font-bold">
            ❌ NO STATES LOADED! Backend might not be running.
          </div>

          <div *ngIf="getStates().length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div *ngFor="let state of getStates()" class="p-3 bg-white border border-blue-200 rounded text-sm">
              <p class="font-semibold">{{ state.name }}</p>
              <p class="text-gray-600">ID: {{ state.id }} | Code: {{ state.code }}</p>
            </div>
          </div>
        </div>

        <!-- Test API Call -->
        <div class="mb-8 p-6 bg-green-50 rounded-lg border-2 border-green-300">
          <h2 class="text-xl font-bold text-green-900 mb-4">🧪 Test API Call</h2>
          <button
            (click)="testGetStates()"
            class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition">
            Test GET /states
          </button>
          <div *ngIf="testResult" class="mt-4 p-4 bg-white border border-green-300 rounded">
            <p class="font-mono text-sm text-gray-800 whitespace-pre-wrap">{{ testResult }}</p>
          </div>
        </div>

        <!-- Test Cities API -->
        <div class="mb-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-300">
          <h2 class="text-xl font-bold text-purple-900 mb-4">🧪 Test Cities API (Maharashtra = ID 14)</h2>
          <button
            (click)="testGetCities()"
            class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition">
            Test GET /states/14/cities
          </button>
          <div *ngIf="citiesResult" class="mt-4 p-4 bg-white border border-purple-300 rounded">
            <p class="font-mono text-sm text-gray-800 whitespace-pre-wrap">{{ citiesResult }}</p>
          </div>
        </div>

        <!-- Backend Status -->
        <div class="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-300">
          <h2 class="text-xl font-bold text-yellow-900 mb-4">⚠️ Backend Requirements</h2>
          <ul class="space-y-2 text-yellow-800">
            <li>✅ Backend must be running on <code class="bg-yellow-100 px-2 py-1 rounded">http://localhost:5000</code></li>
            <li>✅ Database migration must be run: <code class="bg-yellow-100 px-2 py-1 rounded">DATABASE_MIGRATION_LOCATIONS.sql</code></li>
            <li>✅ States table must have 36 records</li>
            <li>✅ Cities table must have 250+ records</li>
            <li>✅ API endpoints must be registered in backend</li>
          </ul>

          <div class="mt-6 p-4 bg-blue-100 border border-blue-300 rounded text-blue-900">
            <p class="font-bold mb-2">🚀 Start Backend:</p>
            <code class="bg-white px-3 py-2 rounded block">cd C:\Users\hussa\mooncraft-backend && npm run dev</code>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LocationDebugComponent implements OnInit {
  private locationService = inject(LocationService);

  testResult: string = '';
  citiesResult: string = '';

  getStates() {
    return this.locationService.getStates();
  }

  ngOnInit() {
    console.log('📍 LocationService states:', this.locationService.getStates());
  }

  testGetStates() {
    this.testResult = 'Loading...';
    this.locationService.http.get<any>('http://localhost:5000/api/v1/locations/states').subscribe({
      next: (response) => {
        this.testResult = JSON.stringify(response, null, 2);
      },
      error: (error) => {
        this.testResult = `❌ ERROR: ${error.message}\n\nMake sure backend is running on port 5000!`;
      }
    });
  }

  testGetCities() {
    this.citiesResult = 'Loading...';
    this.locationService.http.get<any>('http://localhost:5000/api/v1/locations/states/14/cities').subscribe({
      next: (response) => {
        this.citiesResult = JSON.stringify(response, null, 2);
      },
      error: (error) => {
        this.citiesResult = `❌ ERROR: ${error.message}`;
      }
    });
  }
}
