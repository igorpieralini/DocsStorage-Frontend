import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';
import { DashboardComponent } from '../../dashboard/dashboard';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DashboardComponent
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  sidebarCollapsed = false;
  activeRoute = 'dashboard';

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onRouteChange(route: string) {
    this.activeRoute = route;
  }
}
