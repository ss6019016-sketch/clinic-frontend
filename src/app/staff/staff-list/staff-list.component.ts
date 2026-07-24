import { Component, OnInit } from '@angular/core';
import { StaffService } from 'src/app/core/services/staff.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.css']
})
export class StaffListComponent implements OnInit {
  staff: any[] = [];
  searchText = '';
  isLoading = true;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private searchTimeout: any;
  skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    private staffService: StaffService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.loadStaff(); }

  loadStaff(): void {
    this.isLoading = true;
    this.staffService.getAll(this.searchText, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.staff = res.items ?? res;
        this.totalCount = res.totalCount ?? this.staff.length;
        this.totalPages = (res.totalPages ?? Math.ceil(this.totalCount / this.pageSize)) || 1;
        this.isLoading = false;
      },
      error: () => { this.toast.error('Failed to load staff'); this.isLoading = false; }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadStaff();
    }, 400);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadStaff();
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  toggleStatus(member: any): void {
    const newStatus = member.status === 'Active' ? 'Disabled' : 'Active';
    this.staffService.updateStatus(member.id, newStatus).subscribe({
      next: () => {
        member.status = newStatus;
        this.toast.success(`${member.fullName} ${newStatus}!`);
      },
      error: () => this.toast.error('Failed to update status')
    });
  }

  async delete(id: number): Promise<void> {
    const result = await this.confirm.open(
      'Delete Staff', 'Are you sure?', 'danger'
    );
    if (!result) return;

    this.staffService.delete(id).subscribe({
      next: () => {
        this.staff = this.staff.filter(s => s.id !== id);
        this.toast.success('Staff deleted!');
      },
      error: () => this.toast.error('Failed to delete staff')
    });
  }

  getRoleClass(role: string): string {
    const map: any = {
      Admin: 'role-admin',
      Doctor: 'role-doctor',
      Receptionist: 'role-reception'
    };
    return map[role] || '';
  }
}