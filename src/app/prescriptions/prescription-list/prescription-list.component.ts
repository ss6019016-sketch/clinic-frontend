import { Component, OnInit } from '@angular/core';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.css']
})
export class PrescriptionListComponent implements OnInit {

  prescriptions: any[] = [];
  searchText           = '';
  isLoading            = true;

  constructor(
    private rxService: PrescriptionService,
    private toast: ToastService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.rxService.getAll(this.searchText).subscribe({
      next: (data) => { this.prescriptions = data; this.isLoading = false; },
      error: () => { this.toast.error('Failed to load prescriptions'); this.isLoading = false; }
    });
  }

  get filtered(): any[] {
    if (!this.searchText) return this.prescriptions;
    return this.prescriptions.filter(p =>
      p.patientName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      p.doctorName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  async delete(id: number): Promise<void> {
    const result = await this.confirm.open(
      'Delete Prescription', 'Are you sure?', 'danger'
    );
    if (!result) return;

    this.rxService.delete(id).subscribe({
      next: () => {
        this.prescriptions = this.prescriptions.filter(p => p.id !== id);
        this.toast.success('Prescription deleted!');
      },
      error: () => this.toast.error('Failed to delete prescription')
    });
  }
}