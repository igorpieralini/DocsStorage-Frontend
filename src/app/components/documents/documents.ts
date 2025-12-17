import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { FilesService, StorageEntry, StorageInfo } from '../../services/files.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.html',
  styleUrls: ['./documents.css']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  uploadBoxVisible = false;
  private refreshIntervalId?: any;
  // context menu state
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuItem: StorageEntry | null = null;
  clipboard: { item: StorageEntry | null; isCut: boolean } = { item: null, isCut: false };

  createModalVisible = false;
  createType: 'file' | 'folder' = 'file';
  createName = '';
  createTarget = '';
  folderOptions: { label: string; value: string }[] = [];
  items: StorageEntry[] = [];
  storageInfo: StorageInfo | null = null;
  loading = false;
  uploading = false;
  error: string | null = null;
  currentPath = '';
  breadcrumbs: string[] = [];

  constructor(private files: FilesService, private cdr: ChangeDetectorRef, private alert: AlertService) {}

  ngOnDestroy(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    if (this._boundHideContextMenu) {
      window.removeEventListener('click', this._boundHideContextMenu as any);
    }
  }

  ngOnInit(): void {
    this.loadStorageInfo();
    this.loadEntries();

    this.refreshIntervalId = setInterval(() => {
      this.loadStorageInfo();
      this.loadEntries();
    }, 15000);

    this._boundHideContextMenu = this.hideContextMenu.bind(this);
    window.addEventListener('click', this._boundHideContextMenu as any);
  }

  private _boundHideContextMenu?: EventListenerOrEventListenerObject;

  onContextMenu(event: MouseEvent, item: StorageEntry) {
    event.preventDefault();
    this.contextMenuVisible = true;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuItem = item;
  }

  hideContextMenu(): void {
    this.contextMenuVisible = false;
    this.contextMenuItem = null;
  }

  downloadContext() {
    if (!this.contextMenuItem) return;
    this.download(this.contextMenuItem);
    this.hideContextMenu();
  }

  deleteContext() {
    if (!this.contextMenuItem) return;
    const ok = confirm(`Confirma exclusão de "${this.contextMenuItem.name}"?`);
    if (!ok) { this.hideContextMenu(); return; }
    this.files.delete(this.contextMenuItem.name).subscribe({
      next: () => { this.alert.success('Arquivo excluído', 'Excluir'); this.refresh(); },
      error: (err) => { this.alert.error(err?.error?.message || 'Falha ao excluir arquivo.', 'Erro'); }
    });
    this.hideContextMenu();
  }

  moveContext() {
    if (!this.contextMenuItem) return;
    const target = prompt('Mover para (caminho relativo):', '');
    if (!target) { this.hideContextMenu(); return; }
    this.files.move(this.contextMenuItem.name, target).subscribe({
      next: () => { this.alert.success('Arquivo movido', 'Mover'); this.refresh(); },
      error: (err) => { this.alert.error(err?.error?.message || 'Falha ao mover arquivo.', 'Erro'); }
    });
    this.hideContextMenu();
  }

  copyContext() {
    if (!this.contextMenuItem) return;
    this.clipboard = { item: this.contextMenuItem, isCut: false };
    this.alert.info('Arquivo copiado para área de transferência', 'Copiar');
    this.hideContextMenu();
  }

  cutContext() {
    if (!this.contextMenuItem) return;
    this.clipboard = { item: this.contextMenuItem, isCut: true };
    this.alert.info('Arquivo recortado (pronto para mover)', 'Recortar');
    this.hideContextMenu();
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
        const message = err?.error?.message || err?.message || 'Não foi possível obter informações de armazenamento.';
        this.alert.error(message, 'Erro');
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
          // oculta pastas de fotos de perfil (photo_*)
          const filtered = (data.items || []).filter(i => !(i.type === 'dir' && i.name.startsWith('photo_')));
          this.items = filtered as any;
          this.currentPath = data.path || '';
          this.updateBreadcrumbs();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Erro ao carregar arquivos:', err);
          const message = err?.error?.message || err?.message || 'Não foi possível carregar os arquivos.';
          this.error = `Erro ${err.status || ''}: ${message}`;

          // Não limpar a lista atual de arquivos — manter a visualização anterior e mostrar alerta
          this.alert.error(message, 'Erro ao carregar arquivos');
          this.cdr.detectChanges();
        }
      });
  }

  updateBreadcrumbs(): void {
    this.breadcrumbs = this.currentPath
      ? this.currentPath.replace(/\\/g, '/').split('/').filter((p) => p.trim().length > 0)
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
        this.uploadBoxVisible = false;
      }))
      .subscribe({
        next: () => this.refresh(),
        error: (err) => {
          const message = err?.error?.message || 'Falha ao enviar arquivo.';
          this.error = message;
          this.alert.error(message, 'Erro no envio');
        }
      });
  }

  onUploadToggle(): void {
    this.uploadBoxVisible = !this.uploadBoxVisible;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    // reuse upload flow    
    this.uploading = true;
    this.files.upload(file).pipe(finalize(() => {
      this.uploading = false;
      this.uploadBoxVisible = false;
    })).subscribe({
      next: () => this.refresh(),
      error: (err) => {
        const message = err?.error?.message || 'Falha ao enviar arquivo.';
        this.alert.error(message, 'Erro no envio');
      }
    });
  }

  browseFiles(fileInput: HTMLInputElement): void {
    // trigger file picker
    fileInput.click();
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
      error: (err) => {
        const message = err?.error?.message || 'Não foi possível baixar o arquivo.';
        this.error = message;
        this.alert.error(message, 'Erro no download');
      }
    });
  }

  createFolder(): void {
    this.openCreateModal('folder');
  }

  createFile(): void {
    this.openCreateModal('file');
  }

  openCreateModal(type: 'file' | 'folder') {
    this.createType = type;
    this.createName = '';
    // build folder options: Raiz and subfolders
    const opts: { label: string; value: string }[] = [];
    opts.push({ label: 'Raiz', value: '' });
    if (this.currentPath) {
      opts.push({ label: this.currentPath, value: this.currentPath });
    }
    this.items.filter(i => i.type === 'dir').forEach(d => {
      opts.push({ label: d.name, value: d.path });
    });
    this.folderOptions = opts;
    this.createTarget = this.currentPath || '';
    this.createModalVisible = true;
  }

  closeCreateModal() {
    this.createModalVisible = false;
  }

  submitCreate() {
    const name = (this.createName || '').trim();
    if (!name) { this.alert.error('Nome inválido', 'Erro'); return; }
    if (this.createType === 'file') {
      this.files.createFile(name, this.createTarget).subscribe({
        next: () => { this.alert.success('Arquivo criado', 'Criar'); this.refresh(); this.closeCreateModal(); },
        error: (err) => { this.alert.error(err?.error?.message || 'Falha ao criar arquivo', 'Erro'); }
      });
    } else {
      this.files.createFolder(name, this.createTarget).subscribe({
        next: () => { this.alert.success('Pasta criada', 'Criar'); this.refresh(); this.closeCreateModal(); },
        error: (err) => { this.alert.error(err?.error?.message || 'Falha ao criar pasta', 'Erro'); }
      });
    }
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
  }
}
