import { Component, OnInit } from '@angular/core';
import { BillingService } from 'src/app/core/services/billing.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { PermissionService } from 'src/app/core/services/permission.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {

  invoices: any[] = [];
  searchText = '';
  statusFilter = 'All';
  isLoading = true;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private searchTimeout: any;

  displayRevenue = 0;
  displayUnpaid = 0;
  displayCount = 0;

  skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    private billingService: BillingService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.billingService.getAll(this.statusFilter, this.searchText, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.invoices = res.items ?? res;
        this.totalCount = res.totalCount ?? this.invoices.length;
        this.totalPages = (res.totalPages ?? Math.ceil(this.totalCount / this.pageSize)) || 1;
        this.isLoading = false;
        this.animateSummary();
      },
      error: () => { this.toast.error('Failed to load invoices'); this.isLoading = false; }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.load();
    }, 400);
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.load();
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

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

  private animateSummary(): void {
    const duration = 700;
    const start = performance.now();
    const from = { revenue: this.displayRevenue, unpaid: this.displayUnpaid, count: this.displayCount };
    const to = { revenue: this.totalRevenue, unpaid: this.totalUnpaid, count: this.invoices.length };

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.displayRevenue = Math.round(from.revenue + (to.revenue - from.revenue) * eased);
      this.displayUnpaid = Math.round(from.unpaid + (to.unpaid - from.unpaid) * eased);
      this.displayCount = Math.round(from.count + (to.count - from.count) * eased);

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}