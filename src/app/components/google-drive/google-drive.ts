import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleDriveService, GoogleDriveFile } from '../../services/google-drive.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-google-drive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-drive.html',
  styleUrls: ['./google-drive.css']
})
export class GoogleDriveComponent implements OnInit, OnDestroy {
  title = 'Google Drive';
  files: GoogleDriveFile[] = [];
  loading = false;
  error: string | null = null;
  currentFolderId = 'root';
  breadcrumbs: { id: string; name: string }[] = [{ id: 'root', name: 'Meu Drive' }];
  private refreshIntervalId?: any;

  constructor(
    private driveService: GoogleDriveService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.loadFiles();
    
    // Atualiza a lista a cada 30 segundos
    this.refreshIntervalId = setInterval(() => {
      this.loadFiles();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
  }

  loadFiles(): void {
    this.loading = true;
    this.error = null;

    this.driveService.listFiles(this.currentFolderId).subscribe({
      next: (response) => {
        console.log('✅ Resposta do Google Drive:', response);
        this.loading = false;
        if (response.success) {
          this.files = response.files;
          console.log(`📁 ${this.files.length} arquivos carregados`);
        } else {
          this.error = 'Erro ao carregar arquivos do Google Drive';
        }
      },
      error: (err) => {
        console.error('❌ Erro ao carregar arquivos:', err);
        this.loading = false;
        const errorMessage = err?.error?.message || 'Erro ao carregar arquivos do Google Drive. Certifique-se de que você está autenticado.';
        this.error = errorMessage;
        this.alert.error(errorMessage, 'Erro');
      }
    });
  }

  openFolder(folder: GoogleDriveFile): void {
    if (folder.type !== 'folder') return;
    
    this.currentFolderId = folder.id;
    this.breadcrumbs.push({ id: folder.id, name: folder.name });
    this.loadFiles();
  }

  navigateToBreadcrumb(index: number): void {
    if (index === this.breadcrumbs.length - 1) return;
    
    const breadcrumb = this.breadcrumbs[index];
    this.currentFolderId = breadcrumb.id;
    this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    this.loadFiles();
  }

  openFile(file: GoogleDriveFile): void {
    if (file.type === 'folder') {
      this.openFolder(file);
    } else if (file.web_view_link) {
      window.open(file.web_view_link, '_blank');
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '-';
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    
    const mb = kb / 1024;
    if (mb < 1024) {
      return `${mb.toFixed(2)} MB`;
    }
    
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refresh(): void {
    this.loadFiles();
  }
}
