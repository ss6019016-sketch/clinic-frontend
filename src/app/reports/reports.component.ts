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
  invoiceStatusLoading = true;
  paymentMethodLoading = true;

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

  weeklyData: { day: string; date: string; appointments: number; revenue: number }[] = [];
  topDoctors: any[] = [];
  maxRevenue = 100;

  invoiceStatusBreakdown: any[] = [];
  paymentMethodBreakdown: any[] = [];

  // For the skeleton grids — dummy arrays just to *ngFor a placeholder count
  skeletonStatCards = [1, 2, 3, 4];
  skeletonBars = [1, 2, 3, 4, 5, 6, 7];
  skeletonRows = [1, 2, 3, 4, 5];

  statusColors: any = { Paid: '#2f9e44', Unpaid: '#e03131', Partial: '#e0a800' };
  paymentColors: any = { Cash: '#4dabf7', Card: '#845ef7', Online: '#20c997', Unspecified: '#adb5bd' };

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  getPeriodIndex(): number {
    return this.periods.indexOf(this.selectedPeriod);
  }

  selectPeriod(p: string): void {
    if (this.selectedPeriod === p) return;
    this.selectedPeriod = p;
    this.loadAll();
  }

  /** Returns { from, to, days } based on the currently selected period. */
  private getDateRange(): { from: string; to: string; days: number } {
    const to = new Date();
    const from = new Date();
    let days = 7;

    if (this.selectedPeriod === 'monthly') { days = 30; }
    else if (this.selectedPeriod === 'yearly') { days = 365; }

    from.setDate(to.getDate() - (days - 1));

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      days
    };
  }

  loadAll(): void {
    this.statsLoading = true;
    this.chartLoading = true;
    this.doctorsLoading = true;
    this.invoiceStatusLoading = true;
    this.paymentMethodLoading = true;

    const { from, to, days } = this.getDateRange();

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

    // Revenue + Appointments both scoped to the same date range, then merged
    // by actual calendar date so bars/labels can never drift out of sync.
    this.reportsService.getRevenue(from, to).subscribe({
      next: (revenueData) => {
        this.reportsService.getAppointmentStats(from, to).subscribe({
          next: (apptData) => {
            this.weeklyData = this.mergeByDate(from, days, revenueData || [], apptData || []);
            this.maxRevenue = Math.max(...this.weeklyData.map(d => d.revenue), 100);
            this.chartLoading = false;
          },
          error: () => { this.chartLoading = false; }
        });
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

    this.reportsService.getInvoiceStatusBreakdown().subscribe({
      next: (data) => {
        this.invoiceStatusBreakdown = data || [];
        this.invoiceStatusLoading = false;
      },
      error: () => { this.invoiceStatusLoading = false; }
    });

    this.reportsService.getPaymentMethodBreakdown().subscribe({
      next: (data) => {
        this.paymentMethodBreakdown = data || [];
        this.paymentMethodLoading = false;
      },
      error: () => { this.paymentMethodLoading = false; }
    });
  }

  /** Builds one row per calendar day in range and fills in revenue/appointment
   *  totals by matching actual dates — never by array position. Missing days
   *  (no invoices/appointments that day) correctly show as 0 instead of
   *  shifting every later day out of place. */
  private mergeByDate(fromStr: string, days: number, revenueData: any[], apptData: any[]) {
    const revenueByDate = new Map<string, number>();
    revenueData.forEach(d => {
      const key = new Date(d.date).toISOString().split('T')[0];
      revenueByDate.set(key, d.total || 0);
    });

    const apptByDate = new Map<string, number>();
    apptData.forEach(d => {
      const key = new Date(d.date).toISOString().split('T')[0];
      apptByDate.set(key, d.total || 0);
    });

    // Cap how many bars we actually render (monthly/yearly would be unreadable
    // as individual day bars) — show the last 7 calendar days either way.
    const barCount = Math.min(days, 7);
    const start = new Date(fromStr);
    start.setDate(start.getDate() + Math.max(days - barCount, 0));

    const rows = [];
    for (let i = 0; i < barCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().split('T')[0];

      rows.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: key,
        revenue: revenueByDate.get(key) || 0,
        appointments: apptByDate.get(key) || 0
      });
    }
    return rows;
  }

  getBarHeight(val: number): string {
    const h = (val / this.maxRevenue) * 160;
    return Math.max(h, 4) + 'px';
  }

  get invoiceStatusTotal(): number {
    return this.invoiceStatusBreakdown.reduce((sum, s) => sum + s.totalAmount, 0);
  }

  get paymentMethodTotal(): number {
    return this.paymentMethodBreakdown.reduce((sum, s) => sum + s.totalAmount, 0);
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || '#adb5bd';
  }

  getPaymentColor(method: string): string {
    return this.paymentColors[method] || '#adb5bd';
  }

  getSharePercent(amount: number, total: number): number {
    return total > 0 ? Math.round((amount / total) * 100) : 0;
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