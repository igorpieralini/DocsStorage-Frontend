import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Login realizado com sucesso!');
          console.log('Usuário:', res.user);
          this.authService.saveToken(res.token || '');
        } else {
          alert(res.message || 'Erro ao fazer login');
        }
      },
      error: (err) => {
        console.error('Erro completo:', err);
        alert('Erro ao conectar com o servidor: ' + (err.message || 'Verifique se o backend está rodando em http://localhost:5000'));
      }
    });
  }
}
