import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SidebarService } from 'src/app/core/services/sidebar.service';
import { Subscription } from 'rxjs';
import { UploadService } from 'src/app/core/services/upload.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  today    = new Date();
  userName = '';
  userRole = '';
   profilePhoto: string | null = null;
  private sub!: Subscription;

  constructor(
    private auth: AuthService,
    public sidebarService: SidebarService,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    const user    = this.auth.getUser();
    this.userName = user?.name  || 'Admin';
    this.userRole = user?.role  || 'Admin';

      this.sub = this.uploadService.photo$.subscribe(
      photo => this.profilePhoto = photo
    );
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  logout(): void {
     this.uploadService.clearPhoto();
    this.auth.logout();
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}