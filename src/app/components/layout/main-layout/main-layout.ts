import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    RouterModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
