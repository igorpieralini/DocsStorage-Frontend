import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { UploadComponent } from '../upload/upload.component';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [NgFor, UploadComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent {

  docs: any[] = [];

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    this.documentService.getDocuments().subscribe(docs => {
      this.docs = docs;
    });
  }

  download(d: any) {
    this.documentService.downloadDocument(d.id);
  }

  delete(d: any) {
    this.documentService.deleteDocument(d.id).subscribe(() => {
      this.docs = this.docs.filter(x => x.id !== d.id);
    });
  }
}
