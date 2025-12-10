import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OAuthConfig } from '../config/oauth.config';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthSimpleService {
  private currentUser: GoogleUser | null = null;
  private baseUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {
    console.log('✅ GoogleAuthSimpleService inicializado');
  }

  signIn(): void {
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
    } else {
      console.warn('⚠️ Popup bloqueado, redirecionando na mesma janela...');
      window.location.href = url;
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
          email: response.user.email,
          picture: response.user.picture
        };
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao processar callback do Google:', error);
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
    console.log('✅ Logout Google realizado');
  }
}
