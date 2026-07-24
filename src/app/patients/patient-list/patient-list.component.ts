
import { Component, OnInit } from '@angular/core';
import { PatientService } from 'src/app/core/services/patient.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
 
@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit {
 
  patients:  any[] = [];
  searchText = '';
  isLoading  = true;
 
  // Pagination state
  currentPage = 1;
  pageSize    = 10;
  totalCount  = 0;
  totalPages  = 0;
 
  private searchTimeout: any;
 
  skeletonRows = [1, 2, 3, 4, 5, 6];
 
  constructor(
    private patientService: PatientService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}
 
  ngOnInit(): void { this.load(); }
 
  load(): void {
    this.isLoading = true;
    this.patientService.getAll(this.searchText, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.patients   = res.items ?? res;      // fallback in case backend not updated yet
        this.totalCount = res.totalCount ?? this.patients.length;
        this.totalPages = res.totalPages ?? 1;
        this.isLoading  = false;
      },
      error: () => { this.toast.error('Failed to load patients'); this.isLoading = false; }
    });
  }
 
  // Debounced search - waits 400ms after typing stops, then reloads from page 1
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
 
  async deletePatient(id: number): Promise<void> {
  const result = await this.confirm.open(
    'Delete Patient',
    'Are you sure you want to delete this patient?',
    'danger'
  );
  if (!result) return;
 
  this.patientService.delete(id).subscribe({
    next: () => {
      this.toast.success('Patient deleted successfully!');
      // If we deleted the last item on a page beyond page 1, step back a page
      if (this.patients.length === 1 && this.currentPage > 1) {
        this.currentPage--;
      }
      this.load();
    },
    error: (err) => {
      console.error('Delete error:', err);
      this.toast.error('Failed to delete patient');
    }
  });
}
}