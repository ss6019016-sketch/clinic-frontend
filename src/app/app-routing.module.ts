  import { NgModule } from '@angular/core';
  import { RouterModule, Routes } from '@angular/router';
  import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
  import { NotFoundComponent } from './shared/components/not-found/not-found.component';
  import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';

  const routes: Routes = [
    {
      path: '',
      component: MainLayoutComponent,
      canActivate: [AuthGuard],
      children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard',     loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
        { path: 'patients',      loadChildren: () => import('./patients/patients.module').then(m => m.PatientsModule), canActivate: [PermissionGuard], data: { module: 'Patients' } },
        { path: 'doctors',       loadChildren: () => import('./doctors/doctors.module').then(m => m.DoctorsModule), canActivate: [PermissionGuard], data: { module: 'Doctors' } },
        { path: 'appointments',  loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsModule), canActivate: [PermissionGuard], data: { module: 'Appointments' } },
        { path: 'prescriptions', loadChildren: () => import('./prescriptions/prescriptions.module').then(m => m.PrescriptionsModule), canActivate: [PermissionGuard], data: { module: 'Prescriptions' } },
        { path: 'billing',       loadChildren: () => import('./billing/billing.module').then(m => m.BillingModule), canActivate: [PermissionGuard], data: { module: 'Billing' } },
        { path: 'reports',       loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule), canActivate: [PermissionGuard], data: { module: 'Reports' } },
        { path: 'staff',         loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule), canActivate: [PermissionGuard], data: { module: 'Staff' } },
        { path: 'settings',      loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule), canActivate: [PermissionGuard], data: { module: 'Settings' } },
        { path: 'audit-log', loadChildren: () => import('./audit-log/audit-log.module').then(m => m.AuditLogModule) },
        { path: 'permissions', loadChildren: () => import('./permissions/permissions.module').then(m => m.PermissionsModule) },
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