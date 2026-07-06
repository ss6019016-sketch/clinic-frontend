import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SidebarService } from 'src/app/core/services/sidebar.service';

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
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    const user    = this.auth.getUser();
    this.userName = user?.name  || 'Admin';
    this.userRole = user?.role  || 'Admin';
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  logout(): void {
    this.auth.logout();
  }
}