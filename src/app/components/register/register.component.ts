import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  // focus states to replicate login input behavior
  usernameFocused: boolean = false;
  emailFocused: boolean = false;
  passwordFocused: boolean = false;
  confirmFocused: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  onRegister() {
    if (!this.username.trim()) {
      this.alertService.error('Nome de usuário é obrigatório', 'Campo obrigatório');
      return;
    }

    if (!this.email.trim()) {
      this.alertService.error('Email é obrigatório', 'Campo obrigatório');
      return;
    }

    if (!this.password) {
      this.alertService.error('Senha é obrigatória', 'Campo obrigatório');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.alertService.error('As senhas não coincidem', 'Validação');
      return;
    }

    this.isLoading = true;

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.alertService.success('Conta criada com sucesso!', 'Cadastro');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.alertService.error(res.message || 'Erro ao criar conta', 'Falha');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro no cadastro:', err);
        let msg = 'Erro inesperado. Tente novamente.';
        if (err.status === 400 || err.status === 409) msg = err.error?.message || msg;
        this.alertService.error(msg, 'Erro');
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
