import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { GoogleAuthSimpleService, GoogleUser } from '../../../services/google-auth-simple.service';
import { FilesService } from '../../../services/files.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  showUserMenu = false;
  userName: string = 'Usuário';
  userPicture: string | null = null;


  constructor(
    private authService: AuthService,
    private googleAuth: GoogleAuthSimpleService,
    private router: Router,
    private files: FilesService
  ) {
    // Atualiza sempre que o usuário mudar
    this.googleAuth.userChanged$.subscribe(() => this.loadUserPhoto());
    this.authService.currentUser$.subscribe(() => this.loadUserPhoto());
  }

  ngOnInit() {
    this.loadUserPhoto();
  }

  loadUserPhoto() {
    const googleUser: GoogleUser | null = this.googleAuth.getCurrentUser();
    const authUser = this.authService.getUser();
    const user = googleUser || authUser;

    if (user) {
      this.userName = (user as any).name || (user as any).username || (user as any).email || 'Usuário';
      
      const userId = (user as any).id || (user as any).user_id || (user as any).sub;
      // Carrega do cache primeiro para UX rápida
      this.loadPhotoFromCache(userId);
      
      // Tenta carregar foto da pasta photo_{id} primeiro
      if (userId) {
        const folder = `photo_${userId}`;
        this.files.listEntries(folder).subscribe({
          next: (data) => {
            const photos = (data.items || []).filter(i => i.type === 'file');
            if (photos.length > 0) {
              photos.sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime());
              const photoName = photos[0].name;
              this.files.downloadByPath(folder, photoName).subscribe({
                next: (blob) => {
                  this.userPicture = URL.createObjectURL(blob);
                  this.cachePhotoUrl(userId, this.userPicture);
                },
                error: () => {
                  this.setFallbackPhoto(user, userId);
                }
              });
            } else {
              this.setFallbackPhoto(user, userId);
            }
          },
          error: () => {
            this.setFallbackPhoto(user, userId);
          }
        });
      } else {
        this.setFallbackPhoto(user, null);
      }
    } else {
      this.userName = 'Usuário';
      this.userPicture = null;
    }
  }

  private setFallbackPhoto(user: any, userId: string | null) {
    this.userPicture = user.profile_picture || user.picture || null;
    if (this.userPicture && userId) {
      this.cachePhotoUrl(userId, this.userPicture);
    }
  }

  private loadPhotoFromCache(userId: string | null) {
    if (!userId) return;
    try {
      const cached = localStorage.getItem(`user_photo_${userId}`);
      if (cached) {
        this.userPicture = cached;
      }
    } catch {}
  }

  private cachePhotoUrl(userId: string | null, url: string) {
    if (!userId || !url) return;
    try {
      localStorage.setItem(`user_photo_${userId}`, url);
    } catch {}
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.loadUserPhoto(); // Atualiza ao abrir menu
    }
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  logout() {
    this.authService.logout();
    this.googleAuth.signOut();
    this.router.navigate(['/login']);
    this.showUserMenu = false;
  }
}
