import { Component, OnInit } from '@angular/core';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css']
})
export class DoctorListComponent implements OnInit {

  doctors: any[] = [];
  searchText = '';
  isLoading = true;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private searchTimeout: any;
  skeletonRows = [1, 2, 3, 4, 5, 6];

  constructor(
    private doctorService: DoctorService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.doctorService.getAll(this.searchText, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.doctors = res.items ?? res;
        this.totalCount = res.totalCount ?? this.doctors.length;
        this.totalPages = (res.totalPages ?? Math.ceil(this.totalCount / this.pageSize)) || 1;
        this.isLoading = false;
      },
      error: () => { this.toast.error('Failed to load doctors'); this.isLoading = false; }
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

  async deleteDoctor(id: number): Promise<void> {
    const result = await this.confirm.open(
      'Delete Doctor', 'Are you sure?', 'danger'
    );
    if (!result) return;

    this.doctorService.delete(id).subscribe({
      next: () => {
        this.doctors = this.doctors.filter(d => d.id !== id);
        this.toast.success('Doctor deleted!');
      },
      error: () => this.toast.error('Failed to delete doctor')
    });
  }
}