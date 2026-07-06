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

  weeklyData: any[] = [];
  topDoctors:  any[] = [];
  maxRevenue        = 1;

  // Dummy fallback data agar API se khaali aaye
  dummyWeekly = [
    { date: 'Mon', total: 0, count: 0 },
    { date: 'Tue', total: 0, count: 0 },
    { date: 'Wed', total: 0, count: 0 },
    { date: 'Thu', total: 0, count: 0 },
    { date: 'Fri', total: 0, count: 0 },
    { date: 'Sat', total: 0, count: 0 },
    { date: 'Sun', total: 0, count: 0 },
  ];

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;

    // Summary stats
    this.reportsService.getSummary().subscribe({
      next: (data) => {
        this.stats = {
          totalRevenue:      data.totalRevenue      || 0,
          totalAppointments: data.totalAppointments || 0,
          totalPatients:     data.totalPatients     || 0,
          avgPerDay: Math.round((data.totalAppointments || 0) / 30)
        };
      },
      error: () => {}
    });

    // Revenue chart
    this.reportsService.getRevenue().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.weeklyData = data.map((d: any) => ({
            date:  d.date || 'N/A',
            total: d.total || 0,
            count: d.count || 0
          }));
          this.maxRevenue = Math.max(...this.weeklyData.map(d => d.total), 1);
        } else {
          this.weeklyData = this.dummyWeekly;
        }
        this.isLoading = false;
      },
      error: () => {
        this.weeklyData = this.dummyWeekly;
        this.isLoading  = false;
      }
    });

    // Top doctors
    this.reportsService.getTopDoctors().subscribe({
      next: (data) => {
        this.topDoctors = data || [];
      },
      error: () => { this.topDoctors = []; }
    });
  }

  getBarHeight(val: number): string {
    const h = ((val / this.maxRevenue) * 160);
    return (h < 4 ? 4 : h) + 'px';
  }

  getBarLabel(val: number): string {
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  }

  getDateLabel(dateStr: string): string {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  }
}