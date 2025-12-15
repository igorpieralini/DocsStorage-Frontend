import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StorageEntry {
  type: 'file' | 'dir';
  name: string;
  path: string;
  size: number;
  modified_at: string;
}

export interface StorageInfo {
  user_storage: {
    used_bytes: number;
    used_mb: number;
    used_gb: number;
    max_bytes: number;
    max_gb: number;
    available_bytes: number;
    available_gb: number;
    percentage: number;
    files_count: number;
  };
  global_storage: {
    used_bytes: number;
    used_gb: number;
    max_gb: number;
    percentage: number;
  };
}

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly baseUrl = 'http://127.0.0.1:5000/api/files';

  constructor(private http: HttpClient) {}

  listEntries(path: string = ''): Observable<{ items: StorageEntry[]; count: number; path: string }> {
    const options = path ? { params: { path } as Record<string, string> } : {};
    return this.http.get<{ items: StorageEntry[]; count: number; path: string }>(`${this.baseUrl}/`, options);
  }

  storageInfo(): Observable<StorageInfo> {
    return this.http.get<StorageInfo>(`${this.baseUrl}/storage-info`);
  }

  upload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  download(filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${encodeURIComponent(filename)}`, { responseType: 'blob' });
  }

  createFolder(name: string, path: string = ''): Observable<any> {
    return this.http.post(`${this.baseUrl}/mkdir`, { name, path });
  }

  createFile(name: string, path: string = ''): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, { name, path });
  }

  delete(filename: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${encodeURIComponent(filename)}`);
  }

  move(filename: string, targetPath: string = ''): Observable<any> {
    return this.http.post(`${this.baseUrl}/move`, { filename, target_path: targetPath });
  }
}
