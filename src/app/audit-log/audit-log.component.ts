import { Component, OnInit } from '@angular/core';
import { AuditLog, AuditLogService } from 'src/app/core/services/audit-log.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {

  logs: AuditLog[] = [];
  isLoading = true;

  entityFilter = '';
  fromFilter = '';
  toFilter = '';

  entityOptions = ['Doctor', 'Patient', 'Invoice', 'Staff'];

  constructor(
    private auditService: AuditLogService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.auditService.getAll({
      entity: this.entityFilter || undefined,
      from: this.fromFilter || undefined,
      to: this.toFilter || undefined
    }).subscribe({
      next: (data) => { this.logs = data; this.isLoading = false; },
      error: () => { this.toast.error('Failed to load audit logs'); this.isLoading = false; }
    });
  }

  clearFilters(): void {
    this.entityFilter = '';
    this.fromFilter = '';
    this.toFilter = '';
    this.load();
  }

  actionBadgeClass(action: string): string {
    switch (action) {
      case 'Delete': return 'badge-danger';
      case 'Create': return 'badge-success';
      case 'Update': return 'badge-info';
      case 'StatusChange': return 'badge-warning';
      default: return '';
    }
  }
}