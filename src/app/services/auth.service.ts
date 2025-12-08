import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://127.0.0.1:5000/api';
  private loginUrl = `${this.baseUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    console.log('🔗 Fazendo requisição para:', this.loginUrl);
    console.log('📤 Dados enviados:', { email, password: '***' });
    
    const request = this.http.post(this.loginUrl, { email, password });
    
    // Log da resposta para debug
    request.subscribe({
      next: (response) => console.log('📥 Resposta recebida:', response),
      error: (error) => console.error('❌ Erro na requisição:', error)
    });
    
    return request;
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
