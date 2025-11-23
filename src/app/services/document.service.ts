import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private api = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}`);
  }

  uploadDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/upload`, formData);
  }

  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  downloadDocument(id: number) {
    window.location.href = `${this.api}/download/${id}`;
  }
}
