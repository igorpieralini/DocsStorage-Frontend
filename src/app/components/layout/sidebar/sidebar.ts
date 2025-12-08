import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() routeChange = new EventEmitter<string>();
  
  activeRoute = 'dashboard';

  setActive(route: string) {
    this.activeRoute = route;
    this.routeChange.emit(route);
  }
}
