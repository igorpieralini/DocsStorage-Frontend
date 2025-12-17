import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timeout, catchError, throwError, tap, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://127.0.0.1:5000/api';
  private loginUrl = `${this.baseUrl}/auth/login`;

  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Reidrata usuário ao iniciar serviço
    const userStr = sessionStorage.getItem('user_session') || localStorage.getItem('user_data');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        const user = parsed.user ?? parsed; // suporta dois formatos
        this.currentUserSubject.next(user);
      } catch {}
    }
  }

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

  saveToken(token: string, remember: boolean = false, user?: any) {
    if (remember) {
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias
      const data = JSON.stringify({ token, expiresAt });
      localStorage.setItem('token_data', data);
      // Limpa qualquer token de sessão
      sessionStorage.removeItem('token_session');
      if (user) {
        localStorage.setItem('user_data', JSON.stringify({ user }));
        sessionStorage.removeItem('user_session');
      }
    } else {
      sessionStorage.setItem('token_session', token);
      // Não persistir em localStorage
      localStorage.removeItem('token_data');
      if (user) {
        sessionStorage.setItem('user_session', JSON.stringify(user));
        localStorage.removeItem('user_data');
      }
    }
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  updateProfile(name: string, username: string, photoChanged = false): Observable<any> {
    const url = `${this.baseUrl}/auth/profile`;
    return this.http.put(url, { name, username, photo_changed: photoChanged }).pipe(
      tap((resp: any) => {
        const user = resp?.user;
        if (user) {
          const remember = !!localStorage.getItem('token_data');
          this.setUser(user, remember);
        }
      })
    );
  }

  getToken(): string | null {
    // Prioriza token persistente (remember me) se válido
    const dataStr = localStorage.getItem('token_data');
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        if (Date.now() < data.expiresAt) {
          return data.token as string;
        } else {
          localStorage.removeItem('token_data');
        }
      } catch {
        localStorage.removeItem('token_data');
      }
    }
    // Caso contrário, usa sessão atual
    const sessionToken = sessionStorage.getItem('token_session');
    return sessionToken;
  }

  logout() {
    localStorage.removeItem('token_data');
    sessionStorage.removeItem('token_session');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('user_session');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    
    if (!token) {
      console.log('🔒 Sem token - usuário não autenticado');
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      const now = Date.now();

      if (now >= expiration) {
        console.warn('⏰ Token expirado - fazendo logout');
        this.logout();
        return false;
      }

      console.log('✅ Token válido');
      return true;
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      this.logout();
      return false;
    }
  }

  setUser(user: any, remember: boolean = false) {
    if (remember) {
      localStorage.setItem('user_data', JSON.stringify({ user }));
      sessionStorage.removeItem('user_session');
    } else {
      sessionStorage.setItem('user_session', JSON.stringify(user));
      localStorage.removeItem('user_data');
    }
    this.currentUserSubject.next(user);
  }

  getUser(): any | null {
    return this.currentUserSubject.value;
  }
}
