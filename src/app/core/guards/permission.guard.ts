import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PermissionService } from '../services/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: PermissionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const moduleName = route.data['module'] as string | undefined;
    const action = (route.data['action'] || 'view') as string;

    if (!moduleName) {
      return of(true);
    }

    if (!this.permissionService.hasLoaded()) {
      return this.permissionService.loadPermissions().pipe(
        map(() => this.checkAccess(moduleName, action)),
        catchError(() => {
          this.router.navigate(['/dashboard']);
          return of(false);
        })
      );
    }

    return of(this.checkAccess(moduleName, action));
  }

  private checkAccess(moduleName: string, action: string): boolean {
    const normalizedAction = action.toLowerCase();

    const allowed = normalizedAction === 'view'
      ? this.permissionService.canView(moduleName)
      : normalizedAction === 'create'
        ? this.permissionService.canCreate(moduleName)
        : normalizedAction === 'edit'
          ? this.permissionService.canEdit(moduleName)
          : normalizedAction === 'delete'
            ? this.permissionService.canDelete(moduleName)
            : this.permissionService.canView(moduleName);

    if (!allowed) {
      this.router.navigate(['/dashboard']);
    }

    return allowed;
  }
}
