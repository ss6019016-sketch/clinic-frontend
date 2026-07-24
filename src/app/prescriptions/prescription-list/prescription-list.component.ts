import { Component, OnInit } from '@angular/core';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.css']
})
export class PrescriptionListComponent implements OnInit {

  prescriptions: any[] = [];
  searchText = '';
  isLoading = true;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private searchTimeout: any;
  skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    private rxService: PrescriptionService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.rxService.getAll(this.searchText, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.prescriptions = res.items ?? res;
        this.totalCount = res.totalCount ?? this.prescriptions.length;
        this.totalPages = (res.totalPages ?? Math.ceil(this.totalCount / this.pageSize)) || 1;
        this.isLoading = false;
      },
      error: () => { this.toast.error('Failed to load prescriptions'); this.isLoading = false; }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.load();
    }, 400);
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

  async delete(id: number): Promise<void> {
    const result = await this.confirm.open(
      'Delete Prescription', 'Are you sure?', 'danger'
    );
    if (!result) return;

    this.rxService.delete(id).subscribe({
      next: () => {
        this.prescriptions = this.prescriptions.filter(p => p.id !== id);
        this.toast.success('Prescription deleted!');
      },
      error: () => this.toast.error('Failed to delete prescription')
    });
  }
}