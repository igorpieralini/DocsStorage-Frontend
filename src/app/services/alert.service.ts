import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertAction } from '../components/shared/alert/alert';

export interface AlertConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  closable?: boolean;
  autoClose?: boolean;
  autoCloseTime?: number;
  actions?: AlertAction[];
  showProgress?: boolean;
  closeOnOverlay?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<AlertConfig | null>(null);
  public alert$ = this.alertSubject.asObservable();

  constructor() { }

  show(config: AlertConfig) {
    const alertConfig = {
      closable: true,
      autoClose: false,
      autoCloseTime: 3000,
      showProgress: false,
      closeOnOverlay: true,
      ...config
    };
    // Força o reset do alerta para garantir exibição imediata
    this.alertSubject.next(null);
    setTimeout(() => {
      this.alertSubject.next(alertConfig);
    }, 10);
  }

  success(message: string, title?: string, autoClose: boolean = true) {
    this.show({
      type: 'success',
      title,
      message,
      autoClose,
      showProgress: autoClose
    });
  }

  error(message: string, title?: string) {
    this.show({
      type: 'error',
      title: title || 'Erro',
      message,
      autoClose: false
    });
  }

  warning(message: string, title?: string) {
    this.show({
      type: 'warning',
      title: title || 'Aten\u00e7\u00e3o',
      message,
      autoClose: false
    });
  }

  info(message: string, title?: string) {
    this.show({
      type: 'info',
      title,
      message,
      autoClose: true,
      showProgress: true
    });
  }

  confirm(message: string, title?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.show({
        type: 'warning',
        title: title || 'Confirma\u00e7\u00e3o',
        message,
        closable: false,
        actions: [
          { label: 'Cancelar', type: 'secondary', action: 'cancel' },
          { label: 'Confirmar', type: 'primary', action: 'confirm' }
        ]
      });
      
      // Simular resolução - você pode implementar um sistema mais robusto
      const subscription = this.alert$.subscribe((alert) => {
        if (!alert) {
          subscription.unsubscribe();
        }
      });
    });
  }

  hide() {
    this.alertSubject.next(null);
  }
}