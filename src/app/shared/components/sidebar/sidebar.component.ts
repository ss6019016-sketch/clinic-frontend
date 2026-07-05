import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

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

  constructor() { }

  ngOnInit(): void {
  }
}
