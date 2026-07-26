import { Component, OnInit } from '@angular/core';
import { PermissionAdminService, PermissionRow, PermissionUpdateDto } from '../permission-admin.service';
import { ToastService } from 'src/app/core/services/toast.service';

interface PermissionGroup {
  roleName: string;
  isAdmin: boolean;
  rows: PermissionRow[];
}

type PermissionField = 'canView' | 'canCreate' | 'canEdit' | 'canDelete';

@Component({
  selector: 'app-permissions-list',
  templateUrl: './permissions-list.component.html',
  styleUrls: ['./permissions-list.component.css']
})
export class PermissionsListComponent implements OnInit {
  permissions: PermissionRow[] = [];
  groupedPermissions: PermissionGroup[] = [];
  isLoading = true;
  skeletonRows = [1, 2, 3, 4, 5, 6];

  constructor(
    private permissionService: PermissionAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.permissionService.getAll().subscribe({
      next: (rows) => {
        this.permissions = rows;
        this.groupedPermissions = this.buildGroups(rows);
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load permissions');
        this.isLoading = false;
      }
    });
  }

  togglePermission(row: PermissionRow, field: PermissionField, value: boolean): void {
    const previousValue = row[field];
    row[field] = value;

    const dto: PermissionUpdateDto = {
      canView: row.canView,
      canCreate: row.canCreate,
      canEdit: row.canEdit,
      canDelete: row.canDelete
    };

    this.permissionService.update(row.id, dto).subscribe({
      next: () => this.toast.success('Permissions updated'),
      error: () => {
        row[field] = previousValue;
        this.toast.error('Failed to update permissions');
      }
    });
  }

  private moduleIcons: Record<string, string> = {
    Patients: 'bi-heart-pulse',
    Doctors: 'bi-person-badge',
    Appointments: 'bi-calendar3',
    Prescriptions: 'bi-capsule',
    Billing: 'bi-cash-stack',
    Staff: 'bi-people',
    Reports: 'bi-bar-chart',
    AuditLog: 'bi-clock-history',
    Settings: 'bi-gear'
  };

  getModuleIcon(moduleName: string): string {
    return this.moduleIcons[moduleName] || 'bi-grid';
  }

  getRoleInitial(roleName: string): string {
    return roleName?.charAt(0) || '?';
  }

  private buildGroups(rows: PermissionRow[]): PermissionGroup[] {
    const orderedRoles = ['Admin', 'Receptionist', 'Doctor'];

    return orderedRoles.map(roleName => ({
      roleName,
      isAdmin: roleName === 'Admin',
      rows: rows
        .filter(row => row.roleName === roleName)
        .sort((a, b) => a.moduleName.localeCompare(b.moduleName))
    }));
  }
}