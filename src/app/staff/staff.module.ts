import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { StaffFormComponent } from './staff-form/staff-form.component';
import { StaffListComponent } from './staff-list/staff-list.component';



const routes: Routes = [
  { path: '', component: StaffListComponent },
  { path: 'add', component: StaffFormComponent },
  { path: 'edit/:id', component: StaffFormComponent },
];

@NgModule({
  declarations: [StaffListComponent, StaffFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class StaffModule {}