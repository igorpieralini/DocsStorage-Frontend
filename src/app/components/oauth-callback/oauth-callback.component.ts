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
  private alreadyHandled = false;
  private callbackSubscription: any;
  // Global flag to ensure single execution per popup (window scope)
  private static globalCallbackHandled = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private googleAuth: GoogleAuthSimpleService,
    private alertService: AlertService
  ) {}

  async ngOnInit() {
    // Garante execução única por popup (window escopo global)
    if ((window as any).googleCallbackAlreadyHandled || OAuthCallbackComponent.globalCallbackHandled) {
      console.warn('⚠️ Callback já processado neste popup. Ignorando.');
      window.close();
      return;
    }
    (window as any).googleCallbackAlreadyHandled = true;
    OAuthCallbackComponent.globalCallbackHandled = true;

    this.callbackSubscription = this.route.queryParams.subscribe(async params => {
      if (this.alreadyHandled) return;
      this.alreadyHandled = true;
      const code = params['code'];
      if (code) {
        console.log('🟢 [OAuthCallback] code recebido na URL:', code, '| horário:', new Date().toISOString());
      }
      const error = params['error'];

      if (error) {
        console.error('❌ Erro no OAuth:', error);
        if (window.opener) {
          window.opener.postMessage({ type: 'google-auth-error', error: error }, window.location.origin);
          window.close();
        } else {
          this.alertService.error('Login cancelado ou erro no OAuth', 'Falha na Autenticação');
          this.router.navigate(['/login']);
        }
        return;
      }

      if (!code) {
        // Sem código, fecha o popup ou redireciona
        if (window.opener) {
          window.close();
        } else {
          this.alertService.error('Código de autorização ausente. Faça login novamente.', 'Erro Google OAuth');
          this.router.navigate(['/login']);
        }
        return;
      }

      try {
        console.log('✅ Código recebido do Google, processando...');
        const user = await this.googleAuth.handleCallback(code);

        if (user) {
          // Se estiver em popup, fecha e notifica sucesso
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'google-auth-success', 
              user: user,
              code: code
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
          // Se o backend retornou erro de code expirado/invalid_grant
          if (window.opener) {
            window.opener.postMessage({ type: 'google-auth-error', error: 'Código expirado ou inválido. Faça login novamente.' }, window.location.origin);
            window.close();
          } else {
            this.alertService.error('Código expirado, já utilizado ou inválido. Faça login novamente.', 'Erro Google OAuth');
            this.router.navigate(['/login']);
          }
        }
      } catch (error: any) {
        console.error('❌ Erro ao processar callback:', error);
        // Se o backend retornou erro de code expirado/invalid_grant
        if (error?.error?.message && error.error.message.includes('expirado')) {
          if (window.opener) {
            window.opener.postMessage({ type: 'google-auth-error', error: error.error.message }, window.location.origin);
            window.close();
          } else {
            this.alertService.error(error.error.message, 'Erro Google OAuth');
            this.router.navigate(['/login']);
          }
        } else {
          if (window.opener) {
            window.opener.postMessage({ type: 'google-auth-error', error: 'Processing error' }, window.location.origin);
            window.close();
          } else {
            this.alertService.error('Erro ao processar login com Google', 'Falha na Autenticação');
            this.router.navigate(['/login']);
          }
        }
      }
    });
  }
}
