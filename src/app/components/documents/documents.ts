import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.html',
  styleUrls: ['./documents.css']
})
export class DocumentsComponent {
  title = 'Documentos';
}
