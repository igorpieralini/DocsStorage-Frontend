import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService) {}

  submit() {
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {},
      error: () => this.error = 'Usuário ou senha inválidos'
    });
  }
}
