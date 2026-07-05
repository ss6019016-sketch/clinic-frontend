import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DoctorsRoutingModule } from './doctors-routing.module';
import { DoctorListComponent } from './doctor-list/doctor-list.component';
import { DoctorFormComponent } from './doctor-form/doctor-form.component';
import { DoctorDetailsComponent } from './doctor-details/doctor-details.component';


@NgModule({
  declarations: [
    DoctorListComponent,
    DoctorFormComponent,
    DoctorDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DoctorsRoutingModule
  ]
})
export class DoctorsModule { }