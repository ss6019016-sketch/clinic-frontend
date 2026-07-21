import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  role: string;
  action: string;
  entity: string;
  entityId: number;
  details: string | null;
  timestamp: string;
}

export interface AuditLogFilters {
  entity?: string;
  userId?: number;
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  constructor(private api: ApiService) {}

  getAll(filters?: AuditLogFilters): Observable<AuditLog[]> {
    return this.api.get<AuditLog[]>('auditlog', filters as any);
  }
}