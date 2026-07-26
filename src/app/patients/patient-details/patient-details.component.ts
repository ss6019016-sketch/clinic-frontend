import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from 'src/app/core/services/patient.service';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { LabReport, LabReportService } from 'src/app/core/services/lab-report.service';
import { PermissionService } from 'src/app/core/services/permission.service';
 
@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css']
})
export class PatientDetailsComponent implements OnInit {
 
  patient: any = null;
  isLoading    = true;
  patientId: number = 0;

  // ── Lab Reports ──
  labReports: LabReport[] = [];
  reportsLoading = true;
  doctors: any[] = [];
  uploading = false;
  selectedFile: File | null = null;

  newReport = {
    testName: '',
    reportDate: new Date().toISOString().split('T')[0],
    doctorId: '',
    notes: ''
  };
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private labReportService: LabReportService,
    public permissionService: PermissionService
  ) {}
 
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId = +id;
      this.loadPatient(+id);
      this.loadLabReports(+id);
      this.doctorService.getAll(undefined, 1, 1000).subscribe({
        next: (res: any) => this.doctors = res?.items ?? res ?? []
      });
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
 
  printPatient(): void {
    window.print();
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

  // ── Lab Reports ──

  loadLabReports(patientId: number): void {
    this.reportsLoading = true;
    this.labReportService.getByPatient(patientId).subscribe({
      next: (data) => { this.labReports = data; this.reportsLoading = false; },
      error: () => {
        this.toast.error('Failed to load lab reports');
        this.reportsLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (file && file.size > 5 * 1024 * 1024) {
      this.toast.error('Max file size is 5MB');
      input.value = '';
      this.selectedFile = null;
      return;
    }
    this.selectedFile = file;
  }

  uploadReport(): void {
    if (!this.newReport.testName || !this.newReport.reportDate || !this.selectedFile) {
      this.toast.warning('Test name, date, aur file zaroori hain');
      return;
    }

    const formData = new FormData();
    formData.append('PatientId', this.patientId.toString());
    formData.append('TestName', this.newReport.testName);
    formData.append('ReportDate', this.newReport.reportDate);
    if (this.newReport.doctorId) formData.append('DoctorId', this.newReport.doctorId);
    if (this.newReport.notes) formData.append('Notes', this.newReport.notes);
    formData.append('file', this.selectedFile);

    this.uploading = true;
    this.labReportService.upload(formData).subscribe({
      next: () => {
        this.toast.success('Lab report uploaded');
        this.uploading = false;
        this.newReport = { testName: '', reportDate: new Date().toISOString().split('T')[0], doctorId: '', notes: '' };
        this.selectedFile = null;
        this.loadLabReports(this.patientId);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Upload failed');
        this.uploading = false;
      }
    });
  }

  viewReport(report: LabReport): void {
    this.labReportService.getFileBlob(report.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Revoke a little later — the new tab needs the URL to still be
        // valid at the moment it loads the resource.
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      },
      error: () => this.toast.error('Failed to open file')
    });
  }

  async deleteReport(report: LabReport): Promise<void> {
    const result = await this.confirm.open(
      'Delete Lab Report',
      `Remove "${report.testName}"? This cannot be undone.`,
      'danger'
    );
    if (!result) return;

    this.labReportService.delete(report.id).subscribe({
      next: () => {
        this.toast.success('Lab report deleted');
        this.labReports = this.labReports.filter(r => r.id !== report.id);
      },
      error: () => this.toast.error('Failed to delete lab report')
    });
  }

  fileIcon(fileType: string): string {
    return fileType?.includes('pdf') ? 'bi-file-earmark-pdf' : 'bi-file-earmark-image';
  }
}