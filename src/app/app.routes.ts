import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { OAuthCallbackComponent } from './components/oauth-callback/oauth-callback.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'callback', component: OAuthCallbackComponent },
  { path: 'oauth/callback', component: OAuthCallbackComponent },
  { path: 'dashboard', component: MainLayoutComponent, canActivate: [authGuard] },
  { path: 'main', component: MainLayoutComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
