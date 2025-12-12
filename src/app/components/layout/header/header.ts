import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { GoogleAuthSimpleService, GoogleUser } from '../../../services/google-auth-simple.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  showUserMenu = false;
  userName: string = 'Usuário';
  userPicture: string | null = null;


  constructor(
    private authService: AuthService,
    private googleAuth: GoogleAuthSimpleService,
    private router: Router
  ) {
    // Atualiza sempre que o usuário mudar
    this.googleAuth.userChanged$.subscribe((user) => {
      this.setUserInfo();
    });
    this.setUserInfo();
  }

  setUserInfo() {
    const googleUser: GoogleUser | null = this.googleAuth.getCurrentUser();
    if (googleUser) {
      // Debug: logar o objeto recebido do Google
      console.log('🟢 Usuário Google recebido no header:', googleUser);
      // O backend retorna 'username' e 'profile_picture' para Google
      this.userName = googleUser.name || (googleUser as any).username || googleUser.email;
      this.userPicture = googleUser.profile_picture || googleUser.picture || (googleUser as any).profile_picture || (googleUser as any).picture;
    } else {
      // fallback: pegar do token/localStorage se necessário
      const token = this.authService.getToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userName = payload.username || payload.name || payload.email;
        } catch {
          this.userName = 'Usuário';
        }
      } 
      this.userPicture = null;
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.setUserInfo(); // Atualiza ao abrir menu
    }
  }

  logout() {
    this.authService.logout();
    this.googleAuth.signOut();
    this.router.navigate(['/login']);
    this.showUserMenu = false;
  }
}
