import { Component, OnInit } from '@angular/core';
import { MedicineService } from 'src/app/core/services/medicine.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { PermissionService } from 'src/app/core/services/permission.service';

@Component({
  selector: 'app-medicine-list',
  templateUrl: './medicine-list.component.html',
  styleUrls: ['./medicine-list.component.css']
})
export class MedicineListComponent implements OnInit {
  medicines: any[] = [];
  searchText = '';
  isLoading = true;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private searchTimeout: any;
  skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    private medicineService: MedicineService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void { this.loadMedicines(); }

  loadMedicines(): void {
    this.isLoading = true;
    this.medicineService.getAll(this.searchText, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.medicines = res.items ?? res;
        this.totalCount = res.totalCount ?? this.medicines.length;
        this.totalPages = (res.totalPages ?? Math.ceil(this.totalCount / this.pageSize)) || 1;
        this.isLoading = false;
      },
      error: () => { this.toast.error('Failed to load medicines'); this.isLoading = false; }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadMedicines();
    }, 400);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadMedicines();
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  async adjustStock(med: any): Promise<void> {
    const qtyStr = window.prompt(`${med.name} — kitna stock add/remove karna hai?\n(+ number = add, - number = remove)`);
    if (qtyStr === null || qtyStr.trim() === '') return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty === 0) { this.toast.error('Valid number daalo'); return; }

    this.medicineService.adjustStock(med.id, qty, 'Manual adjustment').subscribe({
      next: () => { this.toast.success('Stock updated!'); this.loadMedicines(); },
      error: (err) => this.toast.error(err?.error?.message || 'Stock adjust failed')
    });
  }

  async delete(id: number): Promise<void> {
    const result = await this.confirm.open('Delete Medicine', 'Are you sure?', 'danger');
    if (!result) return;

    this.medicineService.delete(id).subscribe({
      next: () => {
        this.medicines = this.medicines.filter(m => m.id !== id);
        this.toast.success('Medicine moved to trash!');
      },
      error: () => this.toast.error('Failed to delete medicine')
    });
  }
}