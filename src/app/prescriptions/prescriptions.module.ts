import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PrescriptionListComponent } from './prescription-list/prescription-list.component';
import { PrescriptionFormComponent } from './prescription-form/prescription-form.component';



const routes: Routes = [
  { path: '', component: PrescriptionListComponent },
  { path: 'add', component: PrescriptionFormComponent },
  { path: 'edit/:id', component: PrescriptionFormComponent },
];

@NgModule({
  declarations: [PrescriptionListComponent, PrescriptionFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class PrescriptionsModule {}