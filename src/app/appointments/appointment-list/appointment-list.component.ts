import { Component, OnInit } from '@angular/core';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css']
})
export class AppointmentListComponent implements OnInit {
  appointments: any[] = [];
  searchText = '';
  statusFilter = 'All';
  isLoading = true;
  sendingReminderId: number | null = null;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private searchTimeout: any;

  constructor(
    private apptService: AppointmentService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.loadAppointments(); }

  loadAppointments(): void {
    this.isLoading = true;
    this.apptService.getAll(this.statusFilter, this.searchText, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.appointments = res.items ?? res;
        this.totalCount = res.totalCount ?? this.appointments.length;
        this.totalPages = (res.totalPages ?? Math.ceil(this.totalCount / this.pageSize)) || 1;
        this.isLoading = false;
      },
      error: () => { this.toast.error('Failed to load appointments'); this.isLoading = false; }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadAppointments();
    }, 400);
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadAppointments();
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStatusClass(status: string): string {
    const map: any = {
      Confirmed: 'status-confirmed',
      Pending: 'status-pending',
      Completed: 'status-completed',
      Cancelled: 'status-cancelled'
    };
    return map[status] || 'status-pending';
  }

  async deleteAppointment(id: number): Promise<void> {
    const result = await this.confirm.open(
      'Delete Appointment', 'Are you sure?', 'danger'
    );
    if (!result) return;

    this.apptService.delete(id).subscribe({
      next: () => {
        this.appointments = this.appointments.filter(a => a.id !== id);
        this.toast.success('Appointment deleted!');
      },
      error: () => this.toast.error('Failed to delete appointment')
    });
  }

  sendReminder(id: number): void {
    this.sendingReminderId = id;
    this.apptService.sendReminder(id).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Reminder sent!');
        const appt = this.appointments.find(a => a.id === id);
        if (appt) appt.reminderSent = true;
        this.sendingReminderId = null;
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to send reminder');
        this.sendingReminderId = null;
      }
    });
  }
}