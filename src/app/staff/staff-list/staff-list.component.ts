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
  searchText   = '';
  isLoading    = true;

  skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    private staffService: StaffService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.loadStaff(); }

  loadStaff(): void {
    this.isLoading = true;
    this.staffService.getAll(this.searchText).subscribe({
      next: (data) => { this.staff = data; this.isLoading = false; },
      error: () => { this.toast.error('Failed to load staff'); this.isLoading = false; }
    });
  }

  get filtered() {
    if (!this.searchText) return this.staff;
    return this.staff.filter(s =>
      s.fullName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      s.email.toLowerCase().includes(this.searchText.toLowerCase())
    );
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