import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AdminDataTableComponent, ColumnDef } from '../components/admin-data-table.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, AdminDataTableComponent],
  template: `
    <div>
      <app-admin-data-table
        title="User Accounts & Roles"
        addLabel="Create User"
        [columns]="columns"
        [data]="users"
        (editClick)="toggleUserStatus($event)"
        (deleteClick)="deactivateUser($event.id)"
      ></app-admin-data-table>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  apiService = inject(ApiService);
  users: any[] = [];

  columns: ColumnDef[] = [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    { key: 'role.name', label: 'Role', type: 'badge', sortable: true },
    { key: 'isActive', label: 'Account Active', type: 'badge', sortable: true },
    { key: 'createdAt', label: 'Registered Date', type: 'date', sortable: true },
  ];

  ngOnInit() {
    this.apiService.getAllUsers().subscribe(data => this.users = data);
  }

  toggleUserStatus(user: any) {
    const nextState = !user.isActive;
    this.apiService.toggleUserStatus(user.id, nextState).subscribe(() => {
      user.isActive = nextState;
      alert(`User ${user.fullName} is now ${nextState ? 'ACTIVE' : 'DEACTIVATED'}`);
    });
  }

  deactivateUser(id: string) {
    if (confirm('Deactivate this user account?')) {
      this.apiService.toggleUserStatus(id, false).subscribe(() => {
        const target = this.users.find(u => u.id === id);
        if (target) target.isActive = false;
      });
    }
  }
}
