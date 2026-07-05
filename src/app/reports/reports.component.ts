import { Component, OnInit } from '@angular/core';
import { ReportsService } from 'src/app/core/services/reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  selectedPeriod = 'weekly';
  isLoading      = true;

  stats = {
    totalRevenue:      0,
    totalAppointments: 0,
    totalPatients:     0,
    avgPerDay:         0
  };

  weeklyData: any[]  = [];
  topDoctors: any[]  = [];
  maxRevenue         = 0;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;

    this.reportsService.getSummary().subscribe({
      next: (data) => {
        this.stats = {
          totalRevenue:      data.totalRevenue      || 0,
          totalAppointments: data.totalAppointments || 0,
          totalPatients:     data.totalPatients     || 0,
          avgPerDay:         Math.round((data.totalAppointments || 0) / 30)
        };
      }
    });

    this.reportsService.getRevenue().subscribe({
      next: (data) => {
        this.weeklyData = data;
        this.maxRevenue = Math.max(...data.map((d: any) => d.total), 1);
        this.isLoading  = false;
      },
      error: () => { this.isLoading = false; }
    });

    this.reportsService.getTopDoctors().subscribe({
      next: (data) => { this.topDoctors = data; }
    });
  }

  getBarHeight(val: number): string {
    return ((val / this.maxRevenue) * 180) + 'px';
  }
}