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
  searchText          = '';
  statusFilter        = 'All';
  isLoading           = true;

  constructor(
    private apptService: AppointmentService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.loadAppointments(); }

  loadAppointments(): void {
    this.isLoading = true;
    this.apptService.getAll(this.statusFilter, this.searchText).subscribe({
      next: (data) => { this.appointments = data; this.isLoading = false; },
      error: () => { this.toast.error('Failed to load appointments'); this.isLoading = false; }
    });
  }

  get filteredAppointments() { return this.appointments; }

  getStatusClass(status: string): string {
    const map: any = {
      Confirmed: 'status-confirmed',
      Pending:   'status-pending',
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
}