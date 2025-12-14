import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-drive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-drive.html',
  styleUrls: ['./google-drive.css']
})
export class GoogleDriveComponent {
  title = 'Google Drive Integração';
}
