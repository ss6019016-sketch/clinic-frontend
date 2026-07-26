import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PatientService } from 'src/app/core/services/patient.service';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AvailableSlot, DoctorAvailabilityService } from 'src/app/core/services/doctor-avalilability.service';
 
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

  // ── Slot picking, driven by the doctor's Weekly Schedule ──
  availableSlots: AvailableSlot[] = [];
  slotsLoading = false;
  slotsChecked = false; // becomes true once doctor+date have been picked at least once

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apptService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private toast: ToastService,
    private availabilityService: DoctorAvailabilityService
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

    // Re-fetch available slots any time doctor or date changes
    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(() => this.refreshSlots());
    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => this.refreshSlots());
 
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode    = true;
      this.appointmentId = +id;
      this.loadAppointment(+id);
    } else {
      const dateParam = this.route.snapshot.queryParamMap.get('date');
      if (dateParam) {
        this.appointmentForm.patchValue({ appointmentDate: dateParam });
      }
    }
  }
 
  loadDropdowns(): void {
    this.patientService.getAll(undefined, 1, 1000).subscribe({
      next: (res) => this.patients = res?.items ?? res ?? []
    });
    this.doctorService.getAll(undefined, 1, 1000).subscribe({
      next: (res) => this.doctors = res?.items ?? res ?? []
    });
  }
 
  loadAppointment(id: number): void {
    this.apptService.getById(id).subscribe({
      next: (data) => {
        this.appointmentForm.patchValue({
          ...data,
          appointmentDate: data.appointmentDate?.split('T')[0]
        });
        this.refreshSlots();
      },
      error: () => this.toast.error('Failed to load appointment')
    });
  }

  refreshSlots(): void {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const date = this.appointmentForm.get('appointmentDate')?.value;
    const currentTime = this.appointmentForm.get('appointmentTime')?.value;

    if (!doctorId || !date) {
      this.availableSlots = [];
      return;
    }

    this.slotsLoading = true;
    this.slotsChecked = true;
    this.availabilityService.getSlots(+doctorId, date).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.slotsLoading = false;

        // If the currently-selected time isn't one of the valid slots
        // (e.g. doctor was just switched), clear it so a stale time
        // can't be submitted silently.
        if (currentTime && !slots.some(s => s.time === currentTime)) {
          this.appointmentForm.get('appointmentTime')?.setValue('');
        }
      },
      error: () => {
        this.availableSlots = [];
        this.slotsLoading = false;
      }
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

  formatSlot(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  }
}