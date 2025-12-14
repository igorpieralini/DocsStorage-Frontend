import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { GoogleAuthSimpleService } from '../../services/google-auth-simple.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent implements OnDestroy {
  private lastGoogleCode: string | null = null;
  isGooglePopupOpen: boolean = false;

  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  
  // Estados para os campos
  emailFocused: boolean = false;
  passwordFocused: boolean = false;
  showPassword: boolean = false;
  rememberMe: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private googleAuth: GoogleAuthSimpleService
  ) {
    window.addEventListener('message', this.handleAuthMessage.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.handleAuthMessage.bind(this));
  }

  private async handleAuthMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const data = event.data;

    if (data.type === 'google-auth-success') {
      this.googleAuth.setCurrentUser(data.user);
      this.alertService.success(`Bem-vindo, ${data.user.name}!`, 'Login Google Realizado');
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    } else if (data.type === 'google-auth-error') {
      this.alertService.error('Erro ao fazer login com Google', 'Falha na Autenticação');
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {

    if (this.isLoading) return;
    this.isLoading = true;

    if (!this.email.trim()) {
      this.alertService.error('Email é obrigatório', 'Campo obrigatório');
      this.isLoading = false;
      return;
    }

    if (!this.password.trim()) {
      this.alertService.error('Senha é obrigatória', 'Campo obrigatório');
      this.isLoading = false;
      return;
    }
    
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        if (res.success) {
          this.alertService.success('Login realizado com sucesso!', 'Bem-vindo!');
          this.authService.saveToken(res.token || '');
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        } else {
          this.alertService.error(res.message || 'Erro ao fazer login', 'Falha na autenticação');
        }
      },

      error: (err) => {
        this.isLoading = false;
        
        let errorMessage = 'Erro inesperado. Tente novamente.';
        let title = 'Erro';
        
        switch (err.status) {
          case 0:
            errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
            title = 'Erro de Conexão';
            break;
          case 400:
            errorMessage = err.error?.message || 'Dados inválidos';
            title = 'Dados Inválidos';
            break;
          case 401:
            errorMessage = err.error?.message || 'Email ou senha incorretos';
            title = 'Credenciais Inválidas';
            break;
          case 404:
            errorMessage = err.error?.message || 'Usuário não encontrado';
            title = 'Usuário Não Encontrado';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            title = 'Erro do Servidor';
            break;
          default:
            errorMessage = err.error?.message || `Erro ${err.status}: ${err.statusText}`;
            title = 'Erro';
        }
        
        this.alertService.error(errorMessage, title);
      }
    });
  }

  onGoogleLogin() {

    if (this.isGooglePopupOpen) return;
    this.isGooglePopupOpen = true;
    const popup = this.googleAuth.signIn();

    const checkPopupClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopupClosed);
        this.isGooglePopupOpen = false;
      }
    }, 500);

  }
}
