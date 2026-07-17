import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';

export interface State {
  id: number;
  name: string;
  code: string;
}

export interface City {
  id: number;
  name: string;
  state_id?: number;
}

export interface SearchResult {
  id: number;
  name: string;
  state_code: string;
  state_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = '${environment.apiUrl/locations';

  states = signal<State[]>([]);
  cities = signal<City[]>([]);
  selectedState = signal<State | null>(null);

  constructor(public http: HttpClient) {
    this.loadStates();
  }

  // Load all states from database
  private loadStates() {
    this.http.get<any>(`${this.apiUrl}/states`).subscribe({
      next: (response) => {
        if (response.success) {
          this.states.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading states:', error);
      }
    });
  }

  // Get all states
  getStates() {
    return this.states();
  }

  // Get cities by state ID (from database)
  getCitiesByStateId(stateId: number) {
    return this.http.get<any>(`${this.apiUrl}/states/${stateId}/cities`);
  }

  // Get state by code
  getStateByCode(code: string) {
    return this.http.get<any>(`${this.apiUrl}/states/code/${code}`);
  }

  // Get all cities (cached)
  getAllCities() {
    if (this.cities().length > 0) {
      return Promise.resolve(this.cities());
    }

    return this.http.get<any>(`${this.apiUrl}/cities`).toPromise().then(response => {
      if (response?.success) {
        this.cities.set(response.data);
        return response.data;
      }
      return [];
    });
  }

  // Search cities by name
  searchCities(query: string) {
    if (query.length < 2) {
      return Promise.resolve([]);
    }

    return this.http.get<any>(`${this.apiUrl}/search`, {
      params: { query }
    }).toPromise().then(response => {
      if (response?.success) {
        return response.data as SearchResult[];
      }
      return [];
    });
  }

  // Set selected state
  setSelectedState(state: State) {
    this.selectedState.set(state);
  }

  // Get state name by ID
  getStateNameById(stateId: number): Promise<string> {
    const state = this.states().find(s => s.id === stateId);
    if (state) {
      return Promise.resolve(state.name);
    }
    return Promise.resolve('');
  }

  // Get city name by ID
  getCityNameById(cityId: number): Promise<string> {
    const city = this.cities().find(c => c.id === cityId);
    if (city) {
      return Promise.resolve(city.name);
    }
    return Promise.resolve('');
  }
}
