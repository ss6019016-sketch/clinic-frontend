import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  isOpen = false;

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

  ngOnInit(): void {}

  toggle(): void { this.isOpen = !this.isOpen; }
  close():  void { this.isOpen = false; }

  // ESC key se close
  @HostListener('document:keydown.escape')
  onEsc() { this.isOpen = false; }
}