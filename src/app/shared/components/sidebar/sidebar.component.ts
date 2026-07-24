import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidebarService } from 'src/app/core/services/sidebar.service';
import { UploadService } from 'src/app/core/services/upload.service';
import { AuthService } from 'src/app/core/services/auth.service';

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

  menuItems = [
    { label: 'Dashboard',     icon: 'bi-speedometer2',     route: '/dashboard'     },
    { label: 'Patients',      icon: 'bi-people-fill',      route: '/patients'      },
    { label: 'Doctors',       icon: 'bi-person-badge-fill', route: '/doctors'       },
    { label: 'Appointments',  icon: 'bi-calendar-check-fill', route: '/appointments'  },
    { label: 'Prescriptions', icon: 'bi-capsule',          route: '/prescriptions' },
    { label: 'Billing',       icon: 'bi-receipt',          route: '/billing'       },
    { label: 'Reports',       icon: 'bi-graph-up-arrow',   route: '/reports'       },
    { label: 'Staff',         icon: 'bi-person-vcard-fill', route: '/staff'         },
    { label: 'Audit Log', icon: 'bi-clock-history', route: '/audit-log', adminOnly: true },
    { label: 'Settings',      icon: 'bi-gear-fill',        route: '/settings'      },
  ];

  constructor(
    private sidebarService: SidebarService,
    private uploadService: UploadService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const user    = this.auth.getUser();
    this.userName = user?.name || 'Admin';
    this.userRole = user?.role || 'Admin';
    if (this.userRole !== 'Admin') {
  this.menuItems = this.menuItems.filter(item => !item.adminOnly);
}

    this.sub1 = this.sidebarService.state$.subscribe(
      state => this.isOpen = state
    );

    this.sub2 = this.uploadService.photo$.subscribe(
      photo => this.profilePhoto = photo
    );
  }

  close(): void { this.sidebarService.close(); }

  ngOnDestroy(): void {
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
  }
}