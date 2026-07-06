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
    { label: 'Dashboard',     icon: '📊', route: '/dashboard'     },
    { label: 'Patients',      icon: '🧑‍⚕️', route: '/patients'      },
    { label: 'Doctors',       icon: '👨‍⚕️', route: '/doctors'       },
    { label: 'Appointments',  icon: '📅', route: '/appointments'  },
    { label: 'Prescriptions', icon: '💊', route: '/prescriptions' },
    { label: 'Billing',       icon: '🧾', route: '/billing'       },
    { label: 'Reports',       icon: '📈', route: '/reports'       },
    { label: 'Staff',         icon: '👥', route: '/staff'         },
    { label: 'Settings',      icon: '⚙️', route: '/settings'      },
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
    this.sub.unsubscribe();
  }
}