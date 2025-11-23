import { Component } from '@angular/core';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {

  selectedFile: File | null = null;
  message = '';

  constructor(private documentService: DocumentService) {}

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile) {
      this.message = 'Selecione um arquivo';
      return;
    }

    this.documentService.uploadDocument(this.selectedFile).subscribe({
      next: () => this.message = 'Arquivo enviado com sucesso!',
      error: () => this.message = 'Erro ao enviar arquivo'
    });
  }
}
