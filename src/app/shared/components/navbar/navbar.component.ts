import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  today    = new Date();
  userName = '';
  userRole = '';

  constructor(
    private auth: AuthService,
    private sidebar: SidebarComponent
  ) {}

  ngOnInit(): void {
    const user    = this.auth.getUser();
    this.userName = user?.name || 'Admin';
    this.userRole = user?.role || 'Admin';
  }

  toggleSidebar(): void {
    this.sidebar.toggle();
  }

  logout(): void {
    this.auth.logout();
  }
}