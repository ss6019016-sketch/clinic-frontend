import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { PatientService } from 'src/app/core/services/patient.service';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-prescription-form',
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.css']
})
export class PrescriptionFormComponent implements OnInit {

  rxForm!: FormGroup;
  isEditMode = false;
  rxId: number | null = null;
  isLoading  = false;

  patientsLoading = true;
  doctorsLoading  = true;

  patients: any[]  = [];
  doctors: any[]   = [];
  frequencies      = ['Once daily', 'Twice daily', 'Three times daily', 'After meals', 'Before meals', 'At bedtime'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private rxService: PrescriptionService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.rxForm = this.fb.group({
      patientId:    ['', Validators.required],
      doctorId:     ['', Validators.required],
      diagnosis:    ['', Validators.required],
      notes:        [''],
      followUpDate: [''],
      medicines:    this.fb.array([this.newMedicine()])
    });

    this.loadDropdowns();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.rxId       = +id;
      this.loadPrescription(+id);
    }
  }

  loadDropdowns(): void {
    this.patientService.getAll().subscribe({
      next: (d) => { this.patients = d; this.patientsLoading = false; },
      error: () => { this.patientsLoading = false; }
    });
    this.doctorService.getAll().subscribe({
      next: (d) => { this.doctors = d; this.doctorsLoading = false; },
      error: () => { this.doctorsLoading = false; }
    });
  }

  loadPrescription(id: number): void {
    this.rxService.getById(id).subscribe({
      next: (data) => {
        this.rxForm.patchValue({
          patientId:    data.patientId,
          doctorId:     data.doctorId,
          diagnosis:    data.diagnosis,
          notes:        data.notes,
          followUpDate: data.followUpDate?.split('T')[0]
        });
        this.medicines.clear();
        (data.medicines || []).forEach((m: any) => {
          this.medicines.push(this.fb.group({
            medicineName: [m.medicineName, Validators.required],
            dosage:       [m.dosage, Validators.required],
            frequency:    [m.frequency, Validators.required],
            duration:     [m.duration, Validators.required],
            instructions: [m.instructions]
          }));
        });
      },
      error: () => this.toast.error('Failed to load prescription')
    });
  }

  get medicines(): FormArray {
    return this.rxForm.get('medicines') as FormArray;
  }

  newMedicine(): FormGroup {
    return this.fb.group({
      medicineName: ['', Validators.required],
      dosage:       ['', Validators.required],
      frequency:    ['Once daily', Validators.required],
      duration:     ['', Validators.required],
      instructions: ['']
    });
  }

  addMedicine():         void { this.medicines.push(this.newMedicine()); }
  removeMedicine(i: number): void {
    if (this.medicines.length > 1) this.medicines.removeAt(i);
  }

  onSubmit(): void {
    if (this.rxForm.invalid) {
      this.rxForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields!');
      return;
    }

    this.isLoading = true;
    const data     = this.rxForm.value;

    const request = this.isEditMode
      ? this.rxService.update(this.rxId!, data)
      : this.rxService.create(data);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success(this.isEditMode ? 'Prescription updated!' : 'Prescription saved!');
        this.router.navigate(['/prescriptions']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'Something went wrong!');
      }
    });
  }

  get f() { return this.rxForm.controls; }
}