
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ReportsService } from 'src/app/core/services/reports.service';
import { Chart, registerables } from 'chart.js';
 
Chart.register(...registerables);
 
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  today = new Date();
  isLoading = true;
  chartsLoading = true;
 
  @ViewChild('revenueChartCanvas') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChartCanvas') statusChartCanvas!: ElementRef<HTMLCanvasElement>;
  private revenueChart?: Chart;
  private statusChart?: Chart;
 
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
 
  constructor(
    private dashService: DashboardService,
    private reportsService: ReportsService
  ) {}
 
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
 
    this.loadCharts();
  }
 
  loadCharts(): void {
    this.chartsLoading = true;
 
    // Revenue trend - last 30 days (backend defaults to this range when no from/to given)
    this.reportsService.getRevenue().subscribe({
      next: (data) => this.renderRevenueChart(data || []),
      error: () => {}
    });
 
    // Appointments by status - last 30 days, aggregated into a single doughnut
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    this.reportsService.getAppointmentStats(from.toISOString().split('T')[0], to.toISOString().split('T')[0]).subscribe({
      next: (data) => { this.renderStatusChart(data || []); this.chartsLoading = false; },
      error: () => { this.chartsLoading = false; }
    });
  }
 
  private renderRevenueChart(data: any[]): void {
    if (!this.revenueChartCanvas) return;
    const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const values = data.map(d => d.total || 0);
 
    this.revenueChart?.destroy();
    this.revenueChart = new Chart(this.revenueChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (Rs.)',
          data: values,
          borderColor: '#F5A623',
          backgroundColor: 'rgba(245,166,35,0.12)',
          tension: 0.35,
          fill: true,
          pointRadius: 2,
          pointBackgroundColor: '#F5A623'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f0f1f3' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
 
  private renderStatusChart(data: any[]): void {
    if (!this.statusChartCanvas) return;
    const totals = data.reduce((acc: any, d: any) => {
      acc.Confirmed += d.confirmed || 0;
      acc.Pending   += d.pending || 0;
      acc.Completed += d.completed || 0;
      acc.Cancelled += d.cancelled || 0;
      return acc;
    }, { Confirmed: 0, Pending: 0, Completed: 0, Cancelled: 0 });
 
    this.statusChart?.destroy();
    this.statusChart = new Chart(this.statusChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(totals),
        datasets: [{
          data: Object.values(totals),
          backgroundColor: ['#2f9e44', '#e0a800', '#475569', '#c53030'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
        },
        cutout: '65%'
      }
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
 