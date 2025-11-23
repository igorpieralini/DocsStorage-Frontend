import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }) {
    return this.http.post(`${this.api}/login`, data);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
