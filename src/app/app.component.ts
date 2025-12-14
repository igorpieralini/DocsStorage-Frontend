import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './components/shared/alert/alert';
import { AlertService, AlertConfig } from './services/alert.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    
    <!-- Alert Global -->
    <app-alert 
      [visible]="alertConfig !== null"
      [type]="alertConfig?.type || 'info'"
      [title]="alertConfig?.title"
      [message]="alertConfig?.message || ''"
      [closable]="alertConfig?.closable !== false"
      [autoClose]="alertConfig?.autoClose || false"
      [autoCloseTime]="alertConfig?.autoCloseTime || 3000"
      [showProgress]="alertConfig?.showProgress || false"
      [actions]="alertConfig?.actions"
      (closed)="onAlertClosed()"
      (actionClicked)="onAlertAction($event)">
    </app-alert>
  `,
  standalone: true,
  imports: [RouterModule, CommonModule, AlertComponent]
})
export class AppComponent implements OnInit {
  alertConfig: AlertConfig | null = null;

  constructor(private alertService: AlertService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.alertService.alert$.subscribe((config) => {
      this.alertConfig = config;
      this.cdr.detectChanges();
    });
  }

  onAlertClosed() {
    this.alertService.hide();
  }

  onAlertAction(action: string) {
    this.alertService.hide();
  }
}
