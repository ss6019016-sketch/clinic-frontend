import { Component, OnInit } from '@angular/core';
import { ReportsService } from 'src/app/core/services/reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  selectedPeriod = 'weekly';
  periods = ['weekly', 'monthly', 'yearly'];

  // Independent loading flags = each section reveals as soon as its own
  // data is ready, instead of everything waiting on one big spinner.
  statsLoading = true;
  chartLoading = true;
  doctorsLoading = true;

  stats = {
    totalRevenue:      0,
    totalAppointments: 0,
    totalPatients:     0,
    avgPerDay:         0
  };

  // What's actually rendered on screen — animated up from 0 to the real value
  displayStats = {
    totalRevenue:      0,
    totalAppointments: 0,
    totalPatients:     0,
    avgPerDay:         0
  };

  weeklyData = [
    { day: 'Mon', appointments: 0, revenue: 0 },
    { day: 'Tue', appointments: 0, revenue: 0 },
    { day: 'Wed', appointments: 0, revenue: 0 },
    { day: 'Thu', appointments: 0, revenue: 0 },
    { day: 'Fri', appointments: 0, revenue: 0 },
    { day: 'Sat', appointments: 0, revenue: 0 },
    { day: 'Sun', appointments: 0, revenue: 0 },
  ];

  topDoctors: any[] = [];
  maxRevenue = 100;

  // For the skeleton grids — dummy arrays just to *ngFor a placeholder count
  skeletonStatCards = [1, 2, 3, 4];
  skeletonBars = [1, 2, 3, 4, 5, 6, 7];
  skeletonRows = [1, 2, 3, 4, 5];

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  getPeriodIndex(): number {
    return this.periods.indexOf(this.selectedPeriod);
  }

  selectPeriod(p: string): void {
    this.selectedPeriod = p;
    // Hook point: re-fetch data scoped to the new period here if/when
    // the backend supports it. For now it's a visual switch only.
  }

  loadAll(): void {
    this.statsLoading = true;
    this.chartLoading = true;
    this.doctorsLoading = true;

    this.reportsService.getSummary().subscribe({
      next: (data) => {
        this.stats = {
          totalRevenue:      data?.totalRevenue      || 0,
          totalAppointments: data?.totalAppointments || 0,
          totalPatients:     data?.totalPatients     || 0,
          avgPerDay: Math.round((data?.totalAppointments || 0) / 30)
        };
        this.statsLoading = false;
        this.animateStats();
      },
      error: () => { this.statsLoading = false; }
    });

    this.reportsService.getRevenue().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          this.weeklyData = days.map((day, idx) => {
            const found = data[idx];
            return {
              day,
              appointments: found?.count || 0,
              revenue:      found?.total || 0
            };
          });
          this.maxRevenue = Math.max(...this.weeklyData.map(d => d.revenue), 100);
        }
        this.chartLoading = false;
      },
      error: () => { this.chartLoading = false; }
    });

    this.reportsService.getTopDoctors().subscribe({
      next: (data) => {
        this.topDoctors = data || [];
        this.doctorsLoading = false;
      },
      error: () => { this.doctorsLoading = false; }
    });
  }

  getBarHeight(val: number): string {
    const h = (val / this.maxRevenue) * 160;
    return Math.max(h, 4) + 'px';
  }

  // Smoothly counts each stat up from 0 to its real value over ~900ms.
  private animateStats(): void {
    const duration = 900;
    const start = performance.now();
    const from = { ...this.displayStats };
    const to = { ...this.stats };

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic

      this.displayStats = {
        totalRevenue:      Math.round(from.totalRevenue      + (to.totalRevenue      - from.totalRevenue)      * eased),
        totalAppointments: Math.round(from.totalAppointments + (to.totalAppointments - from.totalAppointments) * eased),
        totalPatients:     Math.round(from.totalPatients     + (to.totalPatients     - from.totalPatients)     * eased),
        avgPerDay:         Math.round(from.avgPerDay         + (to.avgPerDay         - from.avgPerDay)         * eased),
      };

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}