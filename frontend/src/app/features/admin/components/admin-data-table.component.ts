import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'rating' | 'price' | 'date' | 'avatar' | 'actions' | 'code';
  sortable?: boolean;
}

@Component({
  selector: 'app-admin-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-card glass-card">
      
      <!-- Top Action Controls Header -->
      <div class="table-toolbar flex-between">
        <div class="search-box">
          <span class="material-icons-outlined search-icon">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="onSearchChange()" 
            [placeholder]="searchPlaceholder || 'Search table records...'" 
          />
        </div>

        <div class="toolbar-actions flex-between">
          
          <!-- Column Visibility Dropdown -->
          <div class="dropdown-wrapper">
            <button class="btn-tool" (click)="showColumnMenu = !showColumnMenu">
              <span class="material-icons-outlined">view_column</span> Columns
            </button>
            <div *ngIf="showColumnMenu" class="dropdown-menu">
              <label *ngFor="let col of columns">
                <input type="checkbox" [checked]="isColumnVisible(col.key)" (change)="toggleColumn(col.key)" />
                {{ col.label }}
              </label>
            </div>
          </div>

          <!-- Export Buttons -->
          <button class="btn-tool" (click)="exportCSV()">
            <span class="material-icons-outlined">file_download</span> CSV
          </button>
          <button class="btn-tool" (click)="exportPDF()">
            <span class="material-icons-outlined">picture_as_pdf</span> PDF
          </button>

          <!-- Create New Record Button -->
          <button *ngIf="showAddButton" class="btn-gradient" (click)="addClick.emit()">
            <span class="material-icons-outlined">add</span> {{ addLabel || 'Add New' }}
          </button>

        </div>
      </div>

      <!-- Bulk Selection Banner -->
      <div *ngIf="selectedRows.size > 0" class="bulk-bar flex-between">
        <span><strong>{{ selectedRows.size }}</strong> items selected</span>
        <div class="bulk-actions">
          <button class="btn-bulk danger" (click)="onBulkDelete()">
            <span class="material-icons-outlined">delete</span> Delete Selected
          </button>
          <button class="btn-bulk" (click)="clearSelection()">Clear</button>
        </div>
      </div>

      <!-- Table Container -->
      <div class="responsive-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th width="40" class="checkbox-col">
                <input type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll()" />
              </th>
              <ng-container *ngFor="let col of columns">
                <th *ngIf="isColumnVisible(col.key)" (click)="sortByColumn(col.key)" [class.sortable]="col.sortable !== false">
                  <div class="th-content">
                    {{ col.label }}
                    <span *ngIf="sortField === col.key" class="material-icons-outlined sort-icon">
                      {{ sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                    </span>
                  </div>
                </th>
              </ng-container>
              <th width="120" class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of pagedData()" [class.selected]="selectedRows.has(row.id)">
              <td class="checkbox-col">
                <input type="checkbox" [checked]="selectedRows.has(row.id)" (change)="toggleRow(row.id)" />
              </td>

              <ng-container *ngFor="let col of columns">
                <td *ngIf="isColumnVisible(col.key)">
                  
                  <!-- Cell Types -->
                  <ng-container [ngSwitch]="col.type">
                    
                    <!-- Code -->
                    <code *ngSwitchCase="'code'">{{ row[col.key] }}</code>
                    
                    <!-- Badge -->
                    <span *ngSwitchCase="'badge'" class="status-badge" [class.success]="row[col.key] === 'CONFIRMED' || row[col.key] === true || row[col.key] === 'PAID' || row[col.key] === 'ACTIVE'" [class.warning]="row[col.key] === 'PENDING'" [class.danger]="row[col.key] === 'CANCELLED' || row[col.key] === false">
                      {{ row[col.key] === true ? 'ACTIVE' : (row[col.key] === false ? 'INACTIVE' : row[col.key]) }}
                    </span>

                    <!-- Rating -->
                    <span *ngSwitchCase="'rating'" class="rating-star">
                      ★ {{ row[col.key] }}
                    </span>

                    <!-- Price -->
                    <strong *ngSwitchCase="'price'" class="price-text">
                      ₹{{ row[col.key] }}
                    </strong>

                    <!-- Date -->
                    <span *ngSwitchCase="'date'">
                      {{ row[col.key] | date:'mediumDate' }}
                    </span>

                    <!-- Default Text -->
                    <span *ngSwitchDefault>{{ getNestedValue(row, col.key) }}</span>
                  </ng-container>

                </td>
              </ng-container>

              <td class="text-right actions-col">
                <button class="btn-icon view" title="View Details" (click)="viewClick.emit(row)">
                  <span class="material-icons-outlined">visibility</span>
                </button>
                <button class="btn-icon edit" title="Edit" (click)="editClick.emit(row)">
                  <span class="material-icons-outlined">edit</span>
                </button>
                <button class="btn-icon delete" title="Delete" (click)="deleteClick.emit(row)">
                  <span class="material-icons-outlined">delete</span>
                </button>
              </td>
            </tr>

            <tr *ngIf="pagedData().length === 0">
              <td [attr.colspan]="columns.length + 2" class="empty-cell">
                <span class="material-icons-outlined">search_off</span> No records found matching criteria
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Toolbar -->
      <div class="table-footer flex-between">
        <div class="page-size-selector">
          <span>Rows per page:</span>
          <select [(ngModel)]="pageSize" (change)="currentPage = 1">
            <option [value]="5">5</option>
            <option [value]="10">10</option>
            <option [value]="25">25</option>
          </select>
        </div>

        <div class="pagination-controls flex-between">
          <span class="page-info">Page {{ currentPage }} of {{ totalPages() }} ({{ filteredCount() }} items)</span>
          <div class="page-btns">
            <button [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1" class="btn-page">
              <span class="material-icons-outlined">chevron_left</span>
            </button>
            <button [disabled]="currentPage >= totalPages()" (click)="currentPage = currentPage + 1" class="btn-page">
              <span class="material-icons-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .table-card {
      padding: 20px;
      margin-bottom: 30px;
    }

    .table-toolbar {
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      .search-box {
        position: relative;
        flex: 1;
        min-width: 240px;

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 20px;
        }

        input {
          width: 100%;
          padding: 10px 14px 10px 40px;
          border-radius: 10px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-main);
          outline: none;
        }
      }

      .toolbar-actions {
        gap: 10px;
      }

      .dropdown-wrapper {
        position: relative;

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 6px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 12px;
          box-shadow: var(--shadow-card);
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 160px;

          label {
            font-size: 0.85rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      }
    }

    .btn-tool {
      background: var(--btn-sec-bg);
      border: 1px solid var(--border-glass);
      color: var(--text-main);
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;

      &:hover {
        background: var(--btn-sec-hover);
      }
    }

    .bulk-bar {
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 10px 16px;
      border-radius: 10px;
      margin-bottom: 16px;
      color: var(--primary-accent);
      font-size: 0.88rem;

      .bulk-actions {
        display: flex;
        gap: 8px;

        .btn-bulk {
          padding: 4px 12px;
          border-radius: 6px;
          border: none;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;

          &.danger {
            background: rgba(239, 68, 68, 0.2);
            color: var(--danger);
          }
        }
      }
    }

    .responsive-table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th, td {
        padding: 12px 14px;
        border-bottom: 1px solid var(--border-glass);
      }

      th {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        background: rgba(0, 0, 0, 0.02);

        &.sortable { cursor: pointer; }
        .th-content { display: flex; align-items: center; gap: 4px; }
        .sort-icon { font-size: 14px; }
      }

      tr:hover td {
        background: rgba(99, 102, 241, 0.04);
      }

      tr.selected td {
        background: rgba(99, 102, 241, 0.08);
      }

      .checkbox-col { text-align: center; }

      .status-badge {
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        display: inline-block;

        &.success { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        &.warning { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        &.danger { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
      }

      code {
        background: var(--input-bg);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8rem;
      }

      .price-text {
        color: var(--text-main);
      }

      .actions-col {
        display: flex;
        gap: 6px;
        justify-content: flex-end;

        .btn-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border-glass);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;

          &:hover {
            &.view { color: var(--primary-accent); background: rgba(99, 102, 241, 0.1); }
            &.edit { color: var(--warning); background: rgba(245, 158, 11, 0.1); }
            &.delete { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
          }

          .material-icons-outlined { font-size: 16px; }
        }
      }

      .empty-cell {
        text-align: center;
        padding: 40px;
        color: var(--text-muted);
      }
    }

    .table-footer {
      margin-top: 16px;
      font-size: 0.85rem;
      color: var(--text-muted);

      .page-size-selector select {
        margin-left: 8px;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid var(--input-border);
        background: var(--input-bg);
        color: var(--text-main);
      }

      .pagination-controls {
        gap: 16px;

        .btn-page {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border-glass);
          background: var(--btn-sec-bg);
          color: var(--text-main);
          cursor: pointer;
          margin-left: 4px;

          &:disabled { opacity: 0.4; cursor: not-allowed; }
          &:hover:not(:disabled) { background: var(--btn-sec-hover); }
        }
      }
    }
  `]
})
export class AdminDataTableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() searchPlaceholder = 'Search...';
  @Input() showAddButton = true;
  @Input() addLabel = 'Add New';

  @Output() addClick = new EventEmitter<void>();
  @Output() viewClick = new EventEmitter<any>();
  @Output() editClick = new EventEmitter<any>();
  @Output() deleteClick = new EventEmitter<any>();
  @Output() bulkDeleteClick = new EventEmitter<any[]>();

  searchQuery = '';
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  pageSize = 10;

  hiddenColumns = new Set<string>();
  selectedRows = new Set<string>();
  showColumnMenu = false;

  onSearchChange() {
    this.currentPage = 1;
  }

  isColumnVisible(key: string): boolean {
    return !this.hiddenColumns.has(key);
  }

  toggleColumn(key: string) {
    if (this.hiddenColumns.has(key)) this.hiddenColumns.delete(key);
    else this.hiddenColumns.add(key);
  }

  sortByColumn(key: string) {
    if (this.sortField === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = key;
      this.sortDir = 'asc';
    }
  }

  getFilteredData(): any[] {
    let result = [...this.data];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(val => val && String(val).toLowerCase().includes(q))
      );
    }

    if (this.sortField) {
      result.sort((a, b) => {
        const valA = this.getNestedValue(a, this.sortField);
        const valB = this.getNestedValue(b, this.sortField);
        if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }

  filteredCount(): number {
    return this.getFilteredData().length;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCount() / this.pageSize));
  }

  pagedData(): any[] {
    const filtered = this.getFilteredData();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  isAllSelected(): boolean {
    const page = this.pagedData();
    return page.length > 0 && page.every(r => this.selectedRows.has(r.id));
  }

  toggleSelectAll() {
    const page = this.pagedData();
    if (this.isAllSelected()) {
      page.forEach(r => this.selectedRows.delete(r.id));
    } else {
      page.forEach(r => this.selectedRows.add(r.id));
    }
  }

  toggleRow(id: string) {
    if (this.selectedRows.has(id)) this.selectedRows.delete(id);
    else this.selectedRows.add(id);
  }

  clearSelection() {
    this.selectedRows.clear();
  }

  onBulkDelete() {
    const items = this.data.filter(r => this.selectedRows.has(r.id));
    this.bulkDeleteClick.emit(items);
    this.clearSelection();
  }

  exportCSV() {
    const rows = this.getFilteredData();
    if (rows.length === 0) return;
    const headers = this.columns.map(c => c.label).join(',');
    const csvContent = [
      headers,
      ...rows.map(row => this.columns.map(c => JSON.stringify(this.getNestedValue(row, c.key) || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Wanderlust_Export_${Date.now()}.csv`;
    link.click();
  }

  exportPDF() {
    alert('📄 PDF Report Generation Initialized! Downloading summary report...');
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, i) => (o ? o[i] : ''), obj);
  }
}
