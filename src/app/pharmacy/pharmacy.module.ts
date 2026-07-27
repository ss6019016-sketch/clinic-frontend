import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';


import { VendorFormComponent } from './vendor-form/vendor-form.component';
import { MedicineListComponent } from './medicine-list/medicine-list.component';
import { MedicineFormComponent } from './medicine-form/medicine-form.component';
import { VendorListComponent } from './vendor-list/vendor-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'medicines', pathMatch: 'full' },
  { path: 'medicines', component: MedicineListComponent },
  { path: 'medicines/add', component: MedicineFormComponent },
  { path: 'medicines/edit/:id', component: MedicineFormComponent },
  { path: 'vendors', component: VendorListComponent },
  { path: 'vendors/add', component: VendorFormComponent },
  { path: 'vendors/edit/:id', component: VendorFormComponent },
];

@NgModule({
  declarations: [
    MedicineListComponent,
    MedicineFormComponent,
    VendorListComponent,
    VendorFormComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class PharmacyModule {}