import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from 'src/app/core/services/patient.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css']
})
export class PatientDetailsComponent implements OnInit {

  patient: any = null;
  isLoading    = true;
  patientId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId = +id;
      this.loadPatient(+id);
    }
  }

  loadPatient(id: number): void {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (data) => {
        this.patient   = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load patient');
        this.isLoading = false;
        this.router.navigate(['/patients']);
      }
    });
  }

  async deletePatient(): Promise<void> {
    const result = await this.confirm.open(
      'Delete Patient',
      'Are you sure you want to delete this patient? This cannot be undone.',
      'danger'
    );
    if (!result) return;

    this.patientService.delete(this.patientId).subscribe({
      next: () => {
        this.toast.success('Patient deleted successfully!');
        this.router.navigate(['/patients']);
      },
      error: () => this.toast.error('Failed to delete patient')
    });
  }
}