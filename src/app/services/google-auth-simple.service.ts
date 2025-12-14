
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OAuthConfig } from '../config/oauth.config';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  profile_picture?: string;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthSimpleService {
  private currentUser: GoogleUser | null = null;
  public userChanged$: BehaviorSubject<GoogleUser | null> = new BehaviorSubject<GoogleUser | null>(null);
    setCurrentUser(user: GoogleUser | null) {
      this.currentUser = user;
      this.userChanged$.next(user);
      // Persiste junto com AuthService (usa mesma storage do token)
      if (user) {
        const token = this.authService.getToken();
        const remember = !!localStorage.getItem('token_data');
        this.authService.setUser(user, remember);
      }
    }
  private baseUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient, private authService: AuthService) {
    console.log('✅ GoogleAuthSimpleService inicializado');
    // Reidrata usuário Google do AuthService se disponível
    const user = this.authService.getUser();
    if (user && (user.google_id || user.picture || user.profile_picture)) {
      this.currentUser = user;
      this.userChanged$.next(user);
    }
  }

  signIn(): Window | null {
    console.log('🔄 Abrindo popup de login do Google...');
    // Cria a URL de autorização do Google
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: OAuthConfig.google.clientId,
      redirect_uri: OAuthConfig.google.redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'online',
      prompt: 'select_account'
    });

    const url = `${authUrl}?${params.toString()}`;
    // Configurações da janela popup
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const popupFeatures = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no`;
    // Abre o popup
    const popup = window.open(url, 'GoogleLogin', popupFeatures);
    if (popup) {
      popup.focus();
      return popup;
    } else {
      console.warn('⚠️ Popup bloqueado, redirecionando na mesma janela...');
      window.location.href = url;
      return null;
    }
  }

  async handleCallback(code: string): Promise<GoogleUser | null> {
    try {
      console.log('✅ Código de autorização recebido do Google');
      // Envia o código para o backend trocar por token e obter dados do usuário
      const response: any = await this.http.post(`${this.baseUrl}/auth/google-callback`, {
        code: code,
        redirectUri: OAuthConfig.google.redirectUri
      }).toPromise();

      if (response.success) {
        console.log('✅ Autenticação com backend bem-sucedida:', response.user);
        this.currentUser = {
          id: response.user.id,
          name: response.user.name || response.user.username,
          username: response.user.username,
          email: response.user.email,
          picture: response.user.picture,
          profile_picture: response.user.profile_picture
        } as any;
        this.userChanged$.next(this.currentUser);
        // Salva o token JWT retornado pelo backend
        if (response.token) {
          this.authService.saveToken(response.token);
        }
        return this.currentUser;
      } else if (response.message && response.message.includes('expirado')) {
        // Erro amigável para code expirado/invalid_grant
        alert(response.message);
      }
      return null;
    } catch (error: any) {
      // Tenta extrair mensagem amigável do backend
      if (error?.error?.message && error.error.message.includes('expirado')) {
        alert(error.error.message);
      } else {
        console.error('❌ Erro ao processar callback do Google:', error);
      }
      throw error;
    }
  }

  getCurrentUser(): GoogleUser | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  signOut(): void {
    this.currentUser = null;
    this.userChanged$.next(null);
    console.log('✅ Logout Google realizado');
  }
}
