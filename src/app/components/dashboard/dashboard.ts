import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  totalDocuments = 0;
  uploadsToday = 0;
  storageUsed = '0 MB';
  syncedFiles = 0;
  
  recentFiles = [
    {
      name: 'Relatório Mensal.pdf',
      type: 'pdf',
      size: '2.3 MB',
      date: '2 horas atrás'
    },
    {
      name: 'Apresentação.pptx',
      type: 'powerpoint',
      size: '5.1 MB',
      date: '1 dia atrás'
    },
    {
      name: 'Planilha Dados.xlsx',
      type: 'excel',
      size: '1.8 MB',
      date: '3 dias atrás'
    }
  ];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Simular carregamento de dados
    this.totalDocuments = 127;
    this.uploadsToday = 5;
    this.storageUsed = '2.4 GB';
    this.syncedFiles = 89;
  }

  getFileIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'fas fa-file-pdf',
      'word': 'fas fa-file-word',
      'excel': 'fas fa-file-excel',
      'powerpoint': 'fas fa-file-powerpoint',
      'image': 'fas fa-file-image',
      'default': 'fas fa-file-alt'
    };
    return icons[type] || icons['default'];
  }
}
