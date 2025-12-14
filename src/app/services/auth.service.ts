import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timeout, catchError, throwError, tap } from 'rxjs';

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
    
    return this.http.post(this.loginUrl, { email, password }).pipe(
      tap({
        next: (response) => console.log('📥 Resposta recebida:', response),
        error: (error) => console.error('❌ Erro na requisição:', error)
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    const registerUrl = `${this.baseUrl}/auth/register`;
    console.log('🔗 Fazendo requisição para:', registerUrl);
    console.log('📤 Dados enviados:', { username, email, password: '***' });
    
    return this.http.post(registerUrl, { username, email, password }).pipe(
      tap({
        next: (response) => console.log('📥 Resposta (register):', response),
        error: (error) => console.error('❌ Erro na requisição (register):', error)
      })
    );
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
