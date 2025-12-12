import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { OAuthCallbackComponent } from './components/oauth-callback/oauth-callback.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'callback', component: OAuthCallbackComponent },
  { path: 'oauth/callback', component: OAuthCallbackComponent },
  { path: 'dashboard', component: MainLayoutComponent },
  { path: 'main', component: MainLayoutComponent },
  { path: '**', redirectTo: 'login' }
];
