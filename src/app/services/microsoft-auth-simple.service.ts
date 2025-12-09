import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare const Microsoft: any;

export interface MicrosoftUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

@Injectable({
  providedIn: 'root'
})
export class MicrosoftAuthSimpleService {
  private userSubject = new BehaviorSubject<MicrosoftUser | null>(null);
  public user$ = this.userSubject.asObservable();
  
  private isInitialized = false;

  constructor() {
    this.loadMicrosoftScript();
  }

  private loadMicrosoftScript(): void {
    if (typeof Microsoft !== 'undefined') {
      this.initializeMicrosoftAuth();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://alcdn.msauth.net/browser/2.37.1/js/msal-browser.min.js';
    script.onload = () => {
      this.initializeMicrosoftAuth();
    };
    document.head.appendChild(script);
  }

  private initializeMicrosoftAuth(): void {
    this.isInitialized = true;
    console.log('✅ Microsoft Auth inicializado');
  }

  async signIn(): Promise<MicrosoftUser | null> {
    try {
      // Usar popup simples para Microsoft
      const popup = window.open(
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
        'client_id=00000000-0000-0000-0000-000000000000&' +
        'response_type=code&' +
        'redirect_uri=' + encodeURIComponent(window.location.origin) + '&' +
        'scope=openid profile email&' +
        'state=12345',
        'microsoft-login',
        'width=500,height=600'
      );

      return new Promise((resolve, reject) => {
        // Simular resposta para demonstração
        setTimeout(() => {
          const mockUser: MicrosoftUser = {
            id: 'mock-ms-id-' + Date.now(),
            displayName: 'Usuário Microsoft',
            mail: 'usuario@outlook.com',
            userPrincipalName: 'usuario@outlook.com'
          };

          this.userSubject.next(mockUser);
          popup?.close();
          
          console.log('✅ Login Microsoft simulado:', mockUser);
          resolve(mockUser);
        }, 2000);

        // Fechar popup se usuário cancelar
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            reject(new Error('Login cancelado'));
          }
        }, 1000);
      });

    } catch (error) {
      console.error('❌ Erro no login Microsoft:', error);
      throw error;
    }
  }

  signOut(): void {
    this.userSubject.next(null);
    console.log('👋 Logout Microsoft realizado');
  }

  getCurrentUser(): MicrosoftUser | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }
}