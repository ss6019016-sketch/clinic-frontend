import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TrashComponent } from './trash.component';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: TrashComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  }
];

@NgModule({
  declarations: [TrashComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class TrashModule {}