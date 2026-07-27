import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidebarService } from 'src/app/core/services/sidebar.service';
import { UploadService } from 'src/app/core/services/upload.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PermissionService } from 'src/app/core/services/permission.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  isOpen       = false;
  userName     = '';
  userRole     = '';
  profilePhoto: string | null = null;

  private sub1!: Subscription;
  private sub2!: Subscription;
  private sub3!: Subscription;

  menuItems = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
    { label: 'Patients', icon: 'bi-people-fill', route: '/patients', module: 'Patients' },
    { label: 'Doctors', icon: 'bi-person-badge-fill', route: '/doctors', module: 'Doctors' },
    { label: 'Appointments', icon: 'bi-calendar-check-fill', route: '/appointments', module: 'Appointments' },
    { label: 'Prescriptions', icon: 'bi-capsule', route: '/prescriptions', module: 'Prescriptions' },
    { label: 'Billing', icon: 'bi-receipt', route: '/billing', module: 'Billing' },
    { label: 'Reports', icon: 'bi-graph-up-arrow', route: '/reports', module: 'Reports' },
    { label: 'Staff', icon: 'bi-person-vcard-fill', route: '/staff', module: 'Staff' },
    { label: 'Roles & Permissions', icon: 'bi-shield-lock-fill', route: '/permissions', adminOnly: true },
    { label: 'Audit Log', icon: 'bi-clock-history', route: '/audit-log', adminOnly: true },
    { label: 'Trash', icon: 'bi-trash3-fill', route: '/trash', adminOnly: true },
    { label: 'Settings', icon: 'bi-gear-fill', route: '/settings', module: 'Settings' },
  ];

  constructor(
    private sidebarService: SidebarService,
    private uploadService: UploadService,
    private auth: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.userName = user?.name || 'Admin';
    this.userRole = user?.role || 'Admin';

    this.sub1 = this.sidebarService.state$.subscribe(
      state => this.isOpen = state
    );

    this.sub2 = this.uploadService.photo$.subscribe(
      photo => this.profilePhoto = photo
    );

    this.sub3 = this.permissionService.permissions$.subscribe(() => {
      this.refreshMenuItems();
    });

    this.refreshMenuItems();
  }

  close(): void { this.sidebarService.close(); }

  private refreshMenuItems(): void {
    this.menuItems = [
      { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
      { label: 'Patients', icon: 'bi-people-fill', route: '/patients', module: 'Patients' },
      { label: 'Doctors', icon: 'bi-person-badge-fill', route: '/doctors', module: 'Doctors' },
      { label: 'Appointments', icon: 'bi-calendar-check-fill', route: '/appointments', module: 'Appointments' },
      { label: 'Prescriptions', icon: 'bi-capsule', route: '/prescriptions', module: 'Prescriptions' },
      { label: 'Billing', icon: 'bi-receipt', route: '/billing', module: 'Billing' },
      { label: 'Reports', icon: 'bi-graph-up-arrow', route: '/reports', module: 'Reports' },
      { label: 'Staff', icon: 'bi-person-vcard-fill', route: '/staff', module: 'Staff' },
      { label: 'Pharmacy', icon: 'bi-capsule', route: '/pharmacy', module: 'Pharmacy' },
      { label: 'Roles & Permissions', icon: 'bi-shield-lock-fill', route: '/permissions', adminOnly: true },
      { label: 'Audit Log', icon: 'bi-clock-history', route: '/audit-log', adminOnly: true },
    { label: 'Trash', icon: 'bi-trash3-fill', route: '/trash', adminOnly: true },
      { label: 'Settings', icon: 'bi-gear-fill', route: '/settings', module: 'Settings' },
    ].filter(item => {
      if (item.route === '/dashboard' || item.route === '/settings') {
        return true;
      }

      if (item.adminOnly) {
        return this.userRole === 'Admin';
      }

      return this.permissionService.canView(item.module || '');
    });
  }

  ngOnDestroy(): void {
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
  }
}