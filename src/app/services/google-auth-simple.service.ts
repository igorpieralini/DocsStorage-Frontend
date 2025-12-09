import { Injectable } from '@angular/core';

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

  constructor() {
    console.log('✅ GoogleAuthSimpleService inicializado');
  }

  async signIn(): Promise<GoogleUser | null> {
    try {
      console.log('🔄 Iniciando login com Google...');
      
      // Simular popup do Google
      const userConfirmed = window.confirm('Deseja fazer login com sua conta Google?');
      
      if (userConfirmed) {
        // Simular dados do usuário Google
        const mockUser: GoogleUser = {
          id: 'google_' + Date.now(),
          name: 'Usuário Google',
          email: 'usuario@gmail.com',
          picture: 'https://via.placeholder.com/100'
        };
        
        this.currentUser = mockUser;
        console.log('✅ Login Google realizado:', mockUser);
        return mockUser;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro no login Google:', error);
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
