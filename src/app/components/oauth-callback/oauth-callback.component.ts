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
  private static globalCallbackHandled = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private googleAuth: GoogleAuthSimpleService,
    private alertService: AlertService
  ) {}

  async ngOnInit() {

    if ((window as any).googleCallbackAlreadyHandled || OAuthCallbackComponent.globalCallbackHandled) {
      window.close();
      return;
    }
    (window as any).googleCallbackAlreadyHandled = true;
    OAuthCallbackComponent.globalCallbackHandled = true;

    this.callbackSubscription = this.route.queryParams.subscribe(async params => {
      if (this.alreadyHandled) return;
      this.alreadyHandled = true;
      const code = params['code'];
      const error = params['error'];

      if (error) {
        if (this.callbackSubscription) {
          this.callbackSubscription.unsubscribe();
        }
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
        if (this.callbackSubscription) {
          this.callbackSubscription.unsubscribe();
        }
        if (window.opener) {
          window.close();
        } else {
          this.alertService.error('Código de autorização ausente. Faça login novamente.', 'Erro Google OAuth');
          this.router.navigate(['/login']);
        }
        return;
      }

      try {
        const user = await this.googleAuth.handleCallback(code);

        // Unsubscribe da query params para evitar reentrância
        if (this.callbackSubscription) {
          this.callbackSubscription.unsubscribe();
        }

        if (user) {

          // Se estiver em popup, fecha e notifica sucesso
          if (window.opener) {
            // Passa também o token para a janela principal salvar localmente
            const tokenData = (window as any).localStorage?.getItem('token_data') || null;
            const sessionToken = (window as any).sessionStorage?.getItem('token_session') || null;
            const token = sessionToken || (tokenData ? JSON.parse(tokenData).token : null);
            window.opener.postMessage({ 
              type: 'google-auth-success', 
              user: user,
              code: code,
              token: token
            }, window.location.origin);
            try { window.close(); } catch {}
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

        // Unsubscribe em caso de erro também
        if (this.callbackSubscription) {
          this.callbackSubscription.unsubscribe();
        }

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
