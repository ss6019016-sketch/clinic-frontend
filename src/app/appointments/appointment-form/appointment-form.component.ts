import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PatientService } from 'src/app/core/services/patient.service';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css']
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
  isEditMode   = false;
  appointmentId: number | null = null;
  isLoading    = false;

  patients: any[]     = [];
  doctors: any[]      = [];
  statusOptions       = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apptService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      patientId:       ['', Validators.required],
      doctorId:        ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      status:          ['Pending'],
      reason:          [''],
      type:            ['New'],
      notes:           ['']
    });

    this.loadDropdowns();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode    = true;
      this.appointmentId = +id;
      this.loadAppointment(+id);
    }
  }

  loadDropdowns(): void {
    this.patientService.getAll().subscribe({
      next: (data) => this.patients = data
    });
    this.doctorService.getAll().subscribe({
      next: (data) => this.doctors = data
    });
  }

  loadAppointment(id: number): void {
    this.apptService.getById(id).subscribe({
      next: (data) => {
        this.appointmentForm.patchValue({
          ...data,
          appointmentDate: data.appointmentDate?.split('T')[0]
        });
      },
      error: () => this.toast.error('Failed to load appointment')
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields!');
      return;
    }

    this.isLoading = true;
    const data     = this.appointmentForm.value;

    const request = this.isEditMode
      ? this.apptService.update(this.appointmentId!, data)
      : this.apptService.create(data);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success(
          this.isEditMode ? 'Appointment updated!' : 'Appointment booked!'
        );
        this.router.navigate(['/appointments']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'Something went wrong!');
      }
    });
  }

  get f() { return this.appointmentForm.controls; }
}