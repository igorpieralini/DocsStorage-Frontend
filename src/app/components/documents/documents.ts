import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { FilesService, StorageEntry, StorageInfo } from '../../services/files.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.html',
  styleUrls: ['./documents.css']
})
export class DocumentsComponent implements OnInit {
  items: StorageEntry[] = [];
  storageInfo: StorageInfo | null = null;
  loading = false;
  uploading = false;
  error: string | null = null;
  currentPath = '';
  breadcrumbs: string[] = [];

  constructor(private files: FilesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadStorageInfo();
    this.loadEntries();
  }

  loadStorageInfo(): void {
    this.files.storageInfo().subscribe({
      next: (info) => {
        console.log('✅ Storage info carregado:', info);
        this.storageInfo = info;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erro ao carregar storage info:', err);
        this.storageInfo = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadEntries(path: string = this.currentPath): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.files
      .listEntries(path)
      .pipe(finalize(() => {
        console.log('📝 finalize() chamado, desligando loading');
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          console.log('✅ Arquivos carregados:', data);
          this.items = data.items;
          this.currentPath = data.path || '';
          this.updateBreadcrumbs();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Erro ao carregar arquivos:', err);
          const message = err?.error?.message || err?.message || 'Não foi possível carregar os arquivos.';
          this.error = `Erro ${err.status || ''}: ${message}`;
          this.items = [];
          this.cdr.detectChanges();
        }
      });
  }

  updateBreadcrumbs(): void {
    this.breadcrumbs = this.currentPath
      ? this.currentPath.split('/').filter((p) => p.trim().length > 0)
      : [];
  }

  goToBreadcrumb(index: number): void {
    const targetPath = this.breadcrumbs.slice(0, index + 1).join('/');
    this.loadEntries(targetPath);
  }

  goToRoot(): void {
    this.loadEntries('');
  }

  enterDir(entry: StorageEntry): void {
    if (entry.type !== 'dir') return;
    this.loadEntries(entry.path);
  }

  refresh(): void {
    this.loadEntries();
    this.loadStorageInfo();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;
    this.files
      .upload(file)
      .pipe(finalize(() => {
        this.uploading = false;
        input.value = '';
      }))
      .subscribe({
        next: () => this.refresh(),
        error: (err) => (this.error = err?.error?.message || 'Falha ao enviar arquivo.')
      });
  }

  download(entry: StorageEntry): void {
    if (entry.type !== 'file') return;
    this.files.download(entry.name).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = entry.name;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => (this.error = 'Não foi possível baixar o arquivo.')
    });
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
  }
}
