import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuditLogComponent } from './audit-log.component';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: AuditLogComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  }
];

@NgModule({
  declarations: [AuditLogComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class AuditLogModule {}