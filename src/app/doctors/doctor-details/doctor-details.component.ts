import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-doctor-details',
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.css']
})
export class DoctorDetailsComponent implements OnInit {

  doctor: any = null;
  isLoading   = true;
  doctorId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.doctorId = +id;
      this.loadDoctor(+id);
    }
  }

  loadDoctor(id: number): void {
    this.isLoading = true;
    this.doctorService.getById(id).subscribe({
      next: (data) => {
        this.doctor    = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load doctor');
        this.isLoading = false;
        this.router.navigate(['/doctors']);
      }
    });
  }

  async deleteDoctor(): Promise<void> {
    const result = await this.confirm.open(
      'Delete Doctor',
      'Are you sure you want to delete this doctor?',
      'danger'
    );
    if (!result) return;

    this.doctorService.delete(this.doctorId).subscribe({
      next: () => {
        this.toast.success('Doctor deleted successfully!');
        this.router.navigate(['/doctors']);
      },
      error: () => this.toast.error('Failed to delete doctor')
    });
  }
}