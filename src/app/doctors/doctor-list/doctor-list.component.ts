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

  doctors:   any[] = [];
  searchText = '';
  isLoading  = true;

  skeletonRows = [1, 2, 3, 4, 5, 6];

  constructor(
    private doctorService: DoctorService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.doctorService.getAll().subscribe({
      next: (data) => { this.doctors = data; this.isLoading = false; },
      error: () => { this.toast.error('Failed to load doctors'); this.isLoading = false; }
    });
  }

  get filteredDoctors(): any[] {
    if (!this.searchText) return this.doctors;
    return this.doctors.filter(d =>
      d.fullName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(this.searchText.toLowerCase())
    );
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