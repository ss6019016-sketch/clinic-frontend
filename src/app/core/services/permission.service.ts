import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface PermissionEntry {
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private permissionsSubject = new BehaviorSubject<PermissionEntry[]>([]);
  permissions$ = this.permissionsSubject.asObservable();
  private loaded = false;

  constructor(private api: ApiService, private auth: AuthService) {}

  loadPermissions(): Observable<PermissionEntry[]> {
    if (!this.auth.isLoggedIn()) {
      this.clearPermissions();
      return of([]);
    }

    return this.api.get<PermissionEntry[]>('permissions/my').pipe(
      map((permissions) => {
        this.permissionsSubject.next(permissions || []);
        this.loaded = true;
        return permissions || [];
      }),
      catchError(() => {
        this.permissionsSubject.next([]);
        this.loaded = false;
        return of([]);
      })
    );
  }

  clearPermissions(): void {
    this.permissionsSubject.next([]);
    this.loaded = false;
  }

  hasLoaded(): boolean {
    return this.loaded;
  }

  canView(moduleName: string): boolean {
    return this.getPermission(moduleName)?.canView ?? false;
  }

  canCreate(moduleName: string): boolean {
    return this.getPermission(moduleName)?.canCreate ?? false;
  }

  canEdit(moduleName: string): boolean {
    return this.getPermission(moduleName)?.canEdit ?? false;
  }

  canDelete(moduleName: string): boolean {
    return this.getPermission(moduleName)?.canDelete ?? false;
  }

  private getPermission(moduleName: string): PermissionEntry | undefined {
    if (!moduleName) {
      return undefined;
    }

    const normalized = moduleName.toLowerCase();
    return this.permissionsSubject.value.find(entry => entry.moduleName?.toLowerCase() === normalized);
  }
}
