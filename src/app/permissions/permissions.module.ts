import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsListComponent } from './permissions-list/permissions-list.component';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: PermissionsListComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  }
];

@NgModule({
  declarations: [PermissionsListComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class PermissionsModule {}
