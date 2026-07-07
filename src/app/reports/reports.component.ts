import { Component, OnInit } from '@angular/core';
import { ReportsService } from 'src/app/core/services/reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  selectedPeriod = 'weekly';
  isLoading = true;

  stats = {
    totalRevenue:      0,
    totalAppointments: 0,
    totalPatients:     0,
    avgPerDay:         0
  };

  // Ye hamesha show hoga — real data aaye ya na aaye
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

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;

    this.reportsService.getSummary().subscribe({
      next: (data) => {
        this.stats = {
          totalRevenue:      data?.totalRevenue      || 0,
          totalAppointments: data?.totalAppointments || 0,
          totalPatients:     data?.totalPatients     || 0,
          avgPerDay: Math.round((data?.totalAppointments || 0) / 30)
        };
      },
      error: () => {}
    });

    this.reportsService.getRevenue().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // Real data merge karo weekly structure mein
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          this.weeklyData = days.map((day, idx) => {
            const found = data[idx];
            return {
              day,
              appointments: found?.count    || 0,
              revenue:      found?.total    || 0
            };
          });
          this.maxRevenue = Math.max(...this.weeklyData.map(d => d.revenue), 100);
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    this.reportsService.getTopDoctors().subscribe({
      next: (data) => { this.topDoctors = data || []; },
      error: () => {}
    });
  }

  getBarHeight(val: number): string {
    const h = (val / this.maxRevenue) * 160;
    return Math.max(h, 4) + 'px';
  }
}