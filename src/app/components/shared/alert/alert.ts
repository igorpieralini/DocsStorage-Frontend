import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AlertAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger' | 'success';
  action: string;
}

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrls: ['./alert.css']
})
export class AlertComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() title?: string;
  @Input() message = '';
  @Input() closable = true;
  @Input() autoClose = false;
  @Input() autoCloseTime = 3000;
  @Input() actions?: AlertAction[];
  @Input() showProgress = false;
  @Input() closeOnOverlay = true;
  
  @Output() closed = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<string>();
  
  progress = 100;
  private autoCloseTimer?: any;
  private progressTimer?: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.visible && this.autoClose) {
      this.startAutoClose();
    }
  }

  ngOnChanges(changes: any) {
    if (changes.visible && changes.visible.currentValue) {
      this.clearTimers();
      if (this.autoClose) {
        this.startAutoClose();
      }
    } else if (this.visible && this.autoClose) {
      this.startAutoClose();
    } else {
      this.clearTimers();
    }
  }

  private startAutoClose() {
    this.progress = 100;
    
    if (this.showProgress) {
      this.progressTimer = setInterval(() => {
        this.progress -= (100 / (this.autoCloseTime / 50));
        if (this.progress <= 0) {
          this.progress = 0;
        }
        // Ensure Angular picks up the changes from this timer
        try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
      }, 50);
    }
    
    this.autoCloseTimer = setTimeout(() => {
      this.close();
    }, this.autoCloseTime);
  }

  private clearTimers() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }

  close() {
    this.visible = false;
    this.clearTimers();
    this.closed.emit();
  }

  onOverlayClick(event: Event) {
    if (this.closeOnOverlay && event.target === event.currentTarget) {
      this.close();
    }
  }

  onActionClick(action: AlertAction) {
    this.actionClicked.emit(action.action);
    this.close();
  }

  getIcon(): string {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[this.type];
  }

  ngOnDestroy() {
    this.clearTimers();
  }
}