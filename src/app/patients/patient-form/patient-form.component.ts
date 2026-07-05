import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from 'src/app/core/services/patient.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  isEditMode   = false;
  patientId: number | null = null;
  isLoading    = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      fullName:         ['', Validators.required],
      age:              ['', [Validators.required, Validators.min(0)]],
      gender:           ['', Validators.required],
      phone:            ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      address:          ['', Validators.required],
      email:            [''],
      bloodGroup:       [''],
      disease:          [''],
      medicalHistory:   [''],
      emergencyContact: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.patientId  = +id;
      this.loadPatient(+id);
    }
  }

  loadPatient(id: number): void {
    this.patientService.getById(id).subscribe({
      next: (data) => this.patientForm.patchValue(data),
      error: () => this.toast.error('Failed to load patient data')
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields!');
      return;
    }

    this.isLoading = true;
    const data     = this.patientForm.value;

    const request = this.isEditMode
      ? this.patientService.update(this.patientId!, data)
      : this.patientService.create(data);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success(
          this.isEditMode ? 'Patient updated!' : 'Patient saved!'
        );
        this.router.navigate(['/patients']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'Something went wrong!');
      }
    });
  }

  get f() { return this.patientForm.controls; }
}