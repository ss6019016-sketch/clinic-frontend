import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';

export interface PermissionRow {
  id: number;
  roleName: string;
  moduleId: number;
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface PermissionUpdateDto {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private api: ApiService) {}

  getAll(): Observable<PermissionRow[]> {
    return this.api.get<PermissionRow[]>('permissions');
  }

  update(id: number, dto: PermissionUpdateDto): Observable<PermissionRow> {
    return this.api.put<PermissionRow>(`permissions/${id}`, dto);
  }
}
