import { Component, OnInit } from '@angular/core';
import { PermissionService } from './core/services/permission.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'clinic';

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    if (this.permissionService.hasLoaded()) {
      return;
    }

    this.permissionService.loadPermissions().subscribe();
  }
}
