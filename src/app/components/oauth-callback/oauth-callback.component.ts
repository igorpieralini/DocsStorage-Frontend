import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleAuthSimpleService } from '../../services/google-auth-simple.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
      <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #4285f4; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 20px; font-size: 18px; color: #666;">Processando login...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `
})
export class OAuthCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private googleAuth: GoogleAuthSimpleService,
    private alertService: AlertService
  ) {}

  async ngOnInit() {
    // Captura o código de autorização da URL
    this.route.queryParams.subscribe(async params => {
      const code = params['code'];
      const error = params['error'];

      if (error) {
        console.error('❌ Erro no OAuth:', error);
        
        // Se estiver em popup, fecha e notifica erro
        if (window.opener) {
          window.opener.postMessage({ type: 'google-auth-error', error: error }, window.location.origin);
          window.close();
        } else {
          this.alertService.error('Login cancelado ou erro no OAuth', 'Falha na Autenticação');
          this.router.navigate(['/login']);
        }
        return;
      }

      if (code) {
        try {
          console.log('✅ Código recebido do Google, processando...');
          const user = await this.googleAuth.handleCallback(code);

          if (user) {
            // Se estiver em popup, fecha e notifica sucesso
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'google-auth-success', 
                user: user 
              }, window.location.origin);
              window.close();
            } else {
              // Se não estiver em popup, redireciona normalmente
              this.alertService.success(`Bem-vindo, ${user.name}!`, 'Login Google Realizado');
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 1500);
            }
          } else {
            if (window.opener) {
              window.opener.postMessage({ type: 'google-auth-error', error: 'Authentication failed' }, window.location.origin);
              window.close();
            } else {
              this.alertService.error('Falha ao autenticar com Google', 'Erro');
              this.router.navigate(['/login']);
            }
          }
        } catch (error) {
          console.error('❌ Erro ao processar callback:', error);
          
          if (window.opener) {
            window.opener.postMessage({ type: 'google-auth-error', error: 'Processing error' }, window.location.origin);
            window.close();
          } else {
            this.alertService.error('Erro ao processar login com Google', 'Falha na Autenticação');
            this.router.navigate(['/login']);
          }
        }
      } else {
        // Sem código, fecha o popup ou redireciona
        if (window.opener) {
          window.close();
        } else {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
