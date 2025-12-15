import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { FilesService } from '../../services/files.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  totalDocuments = 0;
  uploadsToday = 0;
  storageUsed = '0 MB';
  syncedFiles = 0;

  recentFiles: Array<{ name: string; type: string; size: string; date: string; _modified_at?: Date }> = [];
  // quick action state
  createModalVisible = false;
  createName = '';
  createTarget = '';
  folderOptions: { label: string; value: string }[] = [];
  uploading = false;

  constructor(private files: FilesService, private alert: AlertService, private router: Router) {}

  goToDocuments(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/documents']);
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Get storage info
    this.files.storageInfo().subscribe({
      next: (info) => {
        this.storageUsed = `${info.user_storage.used_gb} GB`;
        this.totalDocuments = info.user_storage.files_count || 0;
      },
      error: () => {}
    });

    // Get recent files from root (take most recent files)
    this.files.listEntries('').subscribe({
      next: (data) => {
        const files = (data.items || []).filter((i: any) => i.type === 'file');
        files.sort((a: any, b: any) => (new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()));
        const mapped = files.slice(0, 6).map((f: any) => ({
          name: f.name,
          type: this.detectType(f.name),
          size: this.formatBytes(f.size),
          date: new Date(f.modified_at).toLocaleString(),
          _modified_at: new Date(f.modified_at)
        } as any));
        this.recentFiles = mapped as any;

        // compute uploadsToday from recent files (client-side approximation)
        const today = new Date();
        const isSameDay = (d: Date) => d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
        this.uploadsToday = (files || []).filter((f: any) => isSameDay(new Date(f.modified_at))).length;
      },
      error: () => {}
    });
  }

  // Quick upload from dashboard
  triggerUpload(input: HTMLInputElement) {
    input.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.files.upload(file).pipe(finalize(() => {
      this.uploading = false;
      input.value = '';
      this.loadDashboardData();
    })).subscribe({
      next: () => { this.alert.success('Upload concluído', 'Upload'); },
      error: (err) => { this.alert.error(err?.error?.message || 'Falha ao enviar arquivo', 'Erro'); }
    });
  }

  // Create folder modal
  openCreateModal() {
    this.createName = '';
    this.createTarget = '';
    this.folderOptions = [{ label: 'Raiz', value: '' }];
    this.createModalVisible = true;
  }

  closeCreateModal() { this.createModalVisible = false; }

  submitCreate() {
    const name = (this.createName || '').trim();
    if (!name) { this.alert.error('Nome inválido', 'Erro'); return; }
    this.files.createFolder(name, this.createTarget).subscribe({
      next: () => { this.alert.success('Pasta criada', 'Criar'); this.closeCreateModal(); this.loadDashboardData(); },
      error: (err) => { this.alert.error(err?.error?.message || 'Falha ao criar pasta', 'Erro'); }
    });
  }

  getFileIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'fas fa-file-pdf',
      'word': 'fas fa-file-word',
      'excel': 'fas fa-file-excel',
      'powerpoint': 'fas fa-file-powerpoint',
      'image': 'fas fa-file-image',
      'default': 'fas fa-file-alt'
    };
    return icons[type] || icons['default'];
  }

  detectType(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['png','jpg','jpeg','gif','webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc','docx'].includes(ext)) return 'word';
    if (['xls','xlsx','csv'].includes(ext)) return 'excel';
    if (['ppt','pptx'].includes(ext)) return 'powerpoint';
    return 'default';
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B','KB','MB','GB','TB'];
    const exponent = Math.min(Math.floor(Math.log(bytes)/Math.log(1024)), units.length-1);
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
  }
}
