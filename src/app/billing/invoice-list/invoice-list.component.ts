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

  constructor(
    private billingService: BillingService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.billingService.getAll(this.statusFilter, this.searchText).subscribe({
      next: (data) => { this.invoices = data; this.isLoading = false; },
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
      },
      error: () => this.toast.error('Failed to delete invoice')
    });
  }
}