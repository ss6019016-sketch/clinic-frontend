import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'patients',      loadChildren: () => import('./patients/patients.module').then(m => m.PatientsModule) },
      { path: 'doctors',       loadChildren: () => import('./doctors/doctors.module').then(m => m.DoctorsModule) },
      { path: 'appointments',  loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsModule) },
      { path: 'prescriptions', loadChildren: () => import('./prescriptions/prescriptions.module').then(m => m.PrescriptionsModule) },
      { path: 'billing',       loadChildren: () => import('./billing/billing.module').then(m => m.BillingModule) },
      { path: 'reports',       loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule) },
      { path: 'staff',         loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule) },
      { path: 'settings',      loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) },
    ]
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}