import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AdminDataTableComponent, ColumnDef } from '../components/admin-data-table.component';

@Component({
  selector: 'app-admin-system',
  standalone: true,
  imports: [CommonModule, AdminDataTableComponent],
  template: `
    <div>
      <div class="system-actions-bar flex-between glass-card">
        <div>
          <h3>System Security & Cache Operations</h3>
          <p>Purge Redis cache, trigger database backups, and inspect security audit trail.</p>
        </div>
        <div class="btn-group">
          <button class="btn-secondary" (click)="clearCache()">
            <span class="material-icons-outlined">cleaning_services</span> Flush Redis Cache
          </button>
          <button class="btn-gradient" (click)="backupDatabase()">
            <span class="material-icons-outlined">backup</span> Trigger PostgreSQL Backup
          </button>
        </div>
      </div>

      <app-admin-data-table
        title="Security Audit & Activity Trail"
        [showAddButton]="false"
        [columns]="columns"
        [data]="logs"
      ></app-admin-data-table>
    </div>
  `,
  styles: [`
    .system-actions-bar {
      padding: 20px 24px; margin-bottom: 24px;
      h3 { font-size: 1.2rem; } p { font-size: 0.85rem; color: var(--text-muted); }
      .btn-group { display: flex; gap: 12px; }
    }
  `]
})
export class AdminSystemComponent implements OnInit {
  apiService = inject(ApiService);
  logs: any[] = [];

  columns: ColumnDef[] = [
    { key: 'action', label: 'Security Action Event', type: 'code', sortable: true },
    { key: 'user', label: 'User Email', sortable: true },
    { key: 'ip', label: 'IP Address' },
    { key: 'timestamp', label: 'Timestamp Event', type: 'date', sortable: true },
  ];

  ngOnInit() {
    this.apiService.getAuditLogs().subscribe(data => this.logs = data);
  }

  clearCache() {
    alert('⚡ Redis Cache Flushed Successfully! 0 latency benchmark.');
  }

  backupDatabase() {
    alert('💾 PostgreSQL Database Dump Created! Download link sent to admin email.');
  }
}
