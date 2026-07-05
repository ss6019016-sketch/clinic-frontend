import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  today = new Date();
  isLoading = true;

  stats = {
    totalPatients:     0,
    totalDoctors:      0,
    todayAppointments: 0,
    pendingBills:      0
  };

  recentAppointments: any[] = [];

  constructor(private dashService: DashboardService) {}

  ngOnInit(): void {
    this.dashService.getStats().subscribe({
      next: (data) => {
        this.stats = {
          totalPatients:     data.totalPatients,
          totalDoctors:      data.totalDoctors,
          todayAppointments: data.todayAppointments,
          pendingBills:      data.pendingBills
        };
        this.recentAppointments = data.recentAppointments || [];
        this.isLoading          = false;
      },
      error: () => { this.isLoading = false; }
    });
  }
}