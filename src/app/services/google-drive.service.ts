import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleDriveFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mime_type: string;
  size: number;
  modified_at: string;
  web_view_link?: string;
  icon_link?: string;
  thumbnail_link?: string;
}

export interface GoogleDriveFilesResponse {
  success: boolean;
  files: GoogleDriveFile[];
  count: number;
  next_page_token?: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleDriveService {
  private readonly baseUrl = 'http://127.0.0.1:5000/api/google-drive';

  constructor(private http: HttpClient) {}

  listFiles(folderId: string = 'root', pageSize: number = 100, pageToken?: string): Observable<GoogleDriveFilesResponse> {
    let params: any = { folder_id: folderId, page_size: pageSize.toString() };
    if (pageToken) {
      params.page_token = pageToken;
    }
    return this.http.get<GoogleDriveFilesResponse>(`${this.baseUrl}/files`, { params });
  }

  getFileMetadata(fileId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/file/${fileId}`);
  }
}
