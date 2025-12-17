import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { FilesService } from '../../services/files.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  title = 'Perfil';

  user: any = null;
  name = '';
  username = '';
  uploading = false;
  photoFileName: string | null = null;
  photoPreviewUrl: string | null = null;

  constructor(private auth: AuthService, private files: FilesService, private alert: AlertService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (this.user) {
      this.name = this.user.name || '';
      this.username = this.user.username || '';
      // Tenta carregar do cache primeiro
      this.loadPhotoFromCache();
      // Prioriza foto local na pasta photo_{id}; fallback para profile_picture do Google
      const folder = this.getPhotoFolder();
      this.files.listEntries(folder).subscribe({
        next: (data) => {
          const photos = (data.items || []).filter(i => i.type === 'file');
          if (photos.length > 0) {
            // pega o mais recente
            photos.sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime());
            this.photoFileName = photos[0].name;
            this.loadPreview();
          } else {
            this.loadGooglePhotoFallback();
          }
        },
        error: () => {
          this.loadGooglePhotoFallback();
        }
      });
    }
  }

  getPhotoFolder(): string {
    const id = this.user?.id || this.user?._id || this.user?.user_id;
    return id ? `photo_${id}` : 'photo_unknown';
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.files.upload(file).pipe(finalize(() => {
      this.uploading = false;
      input.value = '';
    })).subscribe({
      next: (resp) => {
        const uploadedName = resp?.file?.filename || resp?.file || file.name;
        // garante que a pasta existe
        this.files.createFolder(this.getPhotoFolder(), '').subscribe({
          next: () => {
            // move o arquivo para a pasta de foto
            this.files.move(uploadedName, this.getPhotoFolder()).subscribe({
              next: () => {
                this.photoFileName = uploadedName;
                this.loadPreview();
                this.auth.updateProfile(this.name, this.username, true).subscribe({
                  next: () => {},
                  error: () => {}
                });
                this.alert.success('Foto de perfil atualizada', 'Perfil');
              },
              error: (err) => {
                this.alert.error(err?.error?.message || 'Falha ao mover foto para pasta de perfil', 'Erro');
              }
            });
          },
          error: () => {
            // mesmo que a pasta já exista, prossegue o move
            this.files.move(uploadedName, this.getPhotoFolder()).subscribe({
              next: () => {
                this.photoFileName = uploadedName;
                this.loadPreview();
                this.auth.updateProfile(this.name, this.username, true).subscribe({
                  next: () => {},
                  error: () => {}
                });
                this.alert.success('Foto de perfil atualizada', 'Perfil');
              },
              error: (err) => {
                this.alert.error(err?.error?.message || 'Falha ao mover foto para pasta de perfil', 'Erro');
              }
            });
          }
        });
      },
      error: (err) => {
        this.alert.error(err?.error?.message || 'Falha no upload da foto', 'Erro');
      }
    });
  }

  saveProfile() {
    this.auth.updateProfile(this.name, this.username, false).subscribe({
      next: () => {
        this.alert.success('Perfil atualizado', 'Perfil');
      },
      error: (err) => {
        this.alert.error(err?.error?.message || 'Falha ao atualizar perfil', 'Erro');
      }
    });
  }

  private loadPreview() {
    if (!this.photoFileName) { this.photoPreviewUrl = null; return; }
    const folder = this.getPhotoFolder();
    this.files.downloadByPath(folder, this.photoFileName).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.photoPreviewUrl = url;
        this.cachePhotoUrl(url);
      },
      error: () => { this.photoPreviewUrl = null; }
    });
  }

  private loadGooglePhotoFallback() {
    const googlePhoto = this.user?.profile_picture || this.user?.picture;
    if (googlePhoto) {
      this.photoPreviewUrl = googlePhoto;
      this.cachePhotoUrl(googlePhoto);
    } else {
      this.photoPreviewUrl = null;
    }
  }

  private loadPhotoFromCache() {
    try {
      const userId = this.user?.id || this.user?._id || this.user?.user_id;
      if (userId) {
        const cached = localStorage.getItem(`user_photo_${userId}`);
        if (cached) {
          this.photoPreviewUrl = cached;
        }
      }
    } catch {}
  }

  private cachePhotoUrl(url: string) {
    try {
      const userId = this.user?.id || this.user?._id || this.user?.user_id;
      if (userId && url) {
        localStorage.setItem(`user_photo_${userId}`, url);
      }
    } catch {}
  }
}
