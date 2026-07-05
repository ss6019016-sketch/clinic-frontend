import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-doctor-form',
  templateUrl: './doctor-form.component.html',
  styleUrls: ['./doctor-form.component.css']
})
export class DoctorFormComponent implements OnInit {
  doctorForm!: FormGroup;
  isEditMode   = false;
  doctorId: number | null = null;
  isLoading    = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.doctorForm = this.fb.group({
      fullName:       ['', Validators.required],
      specialization: ['', Validators.required],
      phone:          ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      email:          ['', [Validators.required, Validators.email]],
      experience:     ['', [Validators.required, Validators.min(0)]],
      availableDays:  [''],
      fee:            ['', [Validators.required, Validators.min(0)]],
      qualification:  [''],
      licenseNumber:  [''],
      bio:            ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.doctorId   = +id;
      this.loadDoctor(+id);
    }
  }

  loadDoctor(id: number): void {
    this.doctorService.getById(id).subscribe({
      next: (data) => this.doctorForm.patchValue(data),
      error: () => this.toast.error('Failed to load doctor data')
    });
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields!');
      return;
    }

    this.isLoading = true;
    const data     = this.doctorForm.value;

    const request = this.isEditMode
      ? this.doctorService.update(this.doctorId!, data)
      : this.doctorService.create(data);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success(this.isEditMode ? 'Doctor updated!' : 'Doctor saved!');
        this.router.navigate(['/doctors']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'Something went wrong!');
      }
    });
  }

  get f() { return this.doctorForm.controls; }
}