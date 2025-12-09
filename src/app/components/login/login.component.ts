import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { GoogleAuthSimpleService } from '../../services/google-auth-simple.service';
import { MicrosoftAuthSimpleService } from '../../services/microsoft-auth-simple.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {

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
    private googleAuth: GoogleAuthSimpleService,
    private microsoftAuth: MicrosoftAuthSimpleService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
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

    console.log('🚀 Iniciando login...');
    
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('✅ Resposta recebida:', res);
        this.isLoading = false;
        
        if (res.success) {
          this.alertService.success('Login realizado com sucesso!', 'Bem-vindo!');
          console.log('Usuário:', res.user);
          this.authService.saveToken(res.token || '');
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        } else {
          console.log('❌ Login falhou:', res.message);
          this.alertService.error(res.message || 'Erro ao fazer login', 'Falha na autenticação');
        }
      },

      error: (err) => {
        this.isLoading = false;
        console.error('❌ Erro completo:', err);
        console.error('📊 Status:', err.status);
        console.error('💬 Mensagem:', err.error);
        
        let errorMessage = 'Erro inesperado. Tente novamente.';
        let title = 'Erro';
        
        // Tratamento específico para cada tipo de erro
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
        
        console.log('🚨 Mostrando alert:', { title, errorMessage });
        this.alertService.error(errorMessage, title);
      }
    });
  }

  // Login com Google
  async onGoogleLogin() {
    try {
      this.isLoading = true;
      const user = await this.googleAuth.signIn();
      
      if (user) {
        this.alertService.success(`Bem-vindo, ${user.name}!`, 'Login Google Realizado');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro no login Google:', error);
      this.alertService.error('Erro ao fazer login com Google', 'Falha na Autenticação');
    } finally {
      this.isLoading = false;
    }
  }

  // Login com Microsoft
  async onMicrosoftLogin() {
    try {
      this.isLoading = true;
      const user = await this.microsoftAuth.signIn();
      
      if (user) {
        this.alertService.success(`Bem-vindo, ${user.displayName}!`, 'Login Microsoft Realizado');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro no login Microsoft:', error);
      this.alertService.error('Erro ao fazer login com Microsoft', 'Falha na Autenticação');
    } finally {
      this.isLoading = false;
    }
  }
}
