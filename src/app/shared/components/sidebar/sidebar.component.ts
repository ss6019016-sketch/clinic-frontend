import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarService } from 'src/app/core/services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  isOpen = false;
  private sub!: Subscription;

  menuItems = [
    { label: 'Dashboard',     icon: 'bi-speedometer2',   route: '/dashboard'     },
    { label: 'Patients',      icon: 'bi-people',         route: '/patients'      },
    { label: 'Doctors',       icon: 'bi-heart-pulse',    route: '/doctors'       },
    { label: 'Appointments',  icon: 'bi-calendar3',      route: '/appointments'  },
    { label: 'Prescriptions', icon: 'bi-capsule',        route: '/prescriptions' },
    { label: 'Billing',       icon: 'bi-receipt',        route: '/billing'       },
    { label: 'Reports',       icon: 'bi-graph-up-arrow', route: '/reports'       },
    { label: 'Staff',         icon: 'bi-person-badge',   route: '/staff'         },
    { label: 'Settings',      icon: 'bi-gear',           route: '/settings'      },
  ];

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sub = this.sidebarService.state$.subscribe(
      state => this.isOpen = state
    );
  }

  close(): void {
    this.sidebarService.close();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}