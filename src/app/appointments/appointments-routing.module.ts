import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';


const routes: Routes = [
  { path: '', component: AppointmentListComponent },
  { path: 'add', component: AppointmentFormComponent },
  { path: 'edit/:id', component: AppointmentFormComponent },
  { path: 'calendar', component: AppointmentCalendarComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }