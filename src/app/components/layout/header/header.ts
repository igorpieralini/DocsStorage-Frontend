import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { GoogleAuthSimpleService, GoogleUser } from '../../../services/google-auth-simple.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
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
    this.googleAuth.userChanged$.subscribe(() => this.setUserInfo());
    this.authService.currentUser$.subscribe(() => this.setUserInfo());
    this.setUserInfo();
  }

  setUserInfo() {
    const googleUser: GoogleUser | null = this.googleAuth.getCurrentUser();
    const authUser = this.authService.getUser();
    if (googleUser) {
      // Debug: logar o objeto recebido do Google
      console.log('🟢 Usuário Google recebido no header:', googleUser);
      // O backend retorna 'username' e 'profile_picture' para Google
      this.userName = googleUser.name || (googleUser as any).username || googleUser.email;
      this.userPicture = googleUser.profile_picture || googleUser.picture || (googleUser as any).profile_picture || (googleUser as any).picture;
    } else if (authUser) {
      this.userName = authUser.username || authUser.name || authUser.email || 'Usuário';
      this.userPicture = authUser.profile_picture || authUser.picture || null;
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

  closeUserMenu() {
    this.showUserMenu = false;
  }

  logout() {
    this.authService.logout();
    this.googleAuth.signOut();
    this.router.navigate(['/login']);
    this.showUserMenu = false;
  }
}
