import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  street_address: string;
  city_id: number;
  state_id: number;
  city_name: string;
  state_name: string;
  state_code: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressListResponse {
  success: boolean;
  message: string;
  data: Address[];
}

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly API_URL = `${environment.apiUrl}/addresses`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserAddresses() {
    return this.http.get<AddressListResponse>(this.API_URL, { headers: this.getHeaders() });
  }
}
