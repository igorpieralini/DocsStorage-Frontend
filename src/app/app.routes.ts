import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { OAuthCallbackComponent } from './components/oauth-callback/oauth-callback.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile';
import { SettingsComponent } from './components/settings/settings';
import { DocumentsComponent } from './components/documents/documents';
import { GoogleDriveComponent } from './components/google-drive/google-drive';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'callback', component: OAuthCallbackComponent },
  { path: 'oauth/callback', component: OAuthCallbackComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'google-drive', component: GoogleDriveComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
