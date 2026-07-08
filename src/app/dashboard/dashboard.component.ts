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

  // Animated display values shown in the cards
  displayStats = {
    totalPatients:     0,
    totalDoctors:      0,
    todayAppointments: 0,
    pendingBills:      0
  };

  recentAppointments: any[] = [];

  skeletonCards = [1, 2, 3, 4];
  skeletonRows  = [1, 2, 3, 4, 5];

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
        this.animateStats();
      },
      error: () => { this.isLoading = false; }
    });
  }

  private animateStats(): void {
    const duration = 900;
    const start = performance.now();
    const from = { ...this.displayStats };
    const to = { ...this.stats };

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.displayStats = {
        totalPatients:     Math.round(from.totalPatients     + (to.totalPatients     - from.totalPatients)     * eased),
        totalDoctors:      Math.round(from.totalDoctors      + (to.totalDoctors      - from.totalDoctors)      * eased),
        todayAppointments: Math.round(from.todayAppointments + (to.todayAppointments - from.todayAppointments) * eased),
        pendingBills:      Math.round(from.pendingBills      + (to.pendingBills      - from.pendingBills)      * eased),
      };

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}