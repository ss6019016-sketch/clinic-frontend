import { Component, OnInit } from '@angular/core';
import { BillingService } from 'src/app/core/services/billing.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {

  invoices: any[] = [];
  searchText      = '';
  statusFilter    = 'All';
  isLoading       = true;

  // Animated display values for the summary cards
  displayRevenue = 0;
  displayUnpaid  = 0;
  displayCount   = 0;

  skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    private billingService: BillingService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.billingService.getAll(this.statusFilter, this.searchText).subscribe({
      next: (data) => {
        this.invoices = data;
        this.isLoading = false;
        this.animateSummary();
      },
      error: () => { this.toast.error('Failed to load invoices'); this.isLoading = false; }
    });
  }

  get filtered(): any[] { return this.invoices; }

  get totalRevenue(): number {
    return this.invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.grandTotal, 0);
  }

  get totalUnpaid(): number {
    return this.invoices
      .filter(i => i.status === 'Unpaid')
      .reduce((sum, i) => sum + i.grandTotal, 0);
  }

  getStatusClass(status: string): string {
    const map: any = {
      Paid: 'status-paid', Unpaid: 'status-unpaid', Partial: 'status-partial'
    };
    return map[status] || '';
  }

  async delete(id: number): Promise<void> {
    const result = await this.confirm.open(
      'Delete Invoice', 'Are you sure?', 'danger'
    );
    if (!result) return;

    this.billingService.delete(id).subscribe({
      next: () => {
        this.invoices = this.invoices.filter(i => i.id !== id);
        this.toast.success('Invoice deleted!');
        this.animateSummary();
      },
      error: () => this.toast.error('Failed to delete invoice')
    });
  }

  // Counts the 3 summary cards up from their current displayed value
  // to the freshly computed one — same easing used across the app.
  private animateSummary(): void {
    const duration = 700;
    const start = performance.now();
    const from = { revenue: this.displayRevenue, unpaid: this.displayUnpaid, count: this.displayCount };
    const to   = { revenue: this.totalRevenue,   unpaid: this.totalUnpaid,   count: this.invoices.length };

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.displayRevenue = Math.round(from.revenue + (to.revenue - from.revenue) * eased);
      this.displayUnpaid  = Math.round(from.unpaid  + (to.unpaid  - from.unpaid)  * eased);
      this.displayCount   = Math.round(from.count   + (to.count   - from.count)   * eased);

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}