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

  constructor(
    private patientService: PatientService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.patientService.getAll().subscribe({
      next: (data) => { this.patients = data; this.isLoading = false; },
      error: () => { this.toast.error('Failed to load patients'); this.isLoading = false; }
    });
  }

  get filteredPatients(): any[] {
    if (!this.searchText) return this.patients;
    return this.patients.filter(p =>
      p.fullName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      p.phone?.includes(this.searchText)
    );
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
        this.patients = this.patients.filter(p => p.id !== id);
        this.toast.success('Patient deleted!');
      },
      error: () => this.toast.error('Failed to delete patient')
    });
  }
}