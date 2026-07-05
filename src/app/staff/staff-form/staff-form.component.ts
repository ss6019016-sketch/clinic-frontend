import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService } from 'src/app/core/services/staff.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html',
  styleUrls: ['./staff-form.component.css']
})
export class StaffFormComponent implements OnInit {

  staffForm!: FormGroup;
  isEditMode   = false;
  staffId: number | null = null;
  isLoading    = false;
  showPassword = false;

  roles = ['Admin', 'Doctor', 'Receptionist'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private staffService: StaffService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.staffForm = this.fb.group({
      fullName: ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      phone:    ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      role:     ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      status:   ['Active']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.staffId    = +id;
      // Edit mode mein password optional
      this.staffForm.get('password')?.clearValidators();
      this.staffForm.get('password')?.updateValueAndValidity();
      this.loadStaff(+id);
    }
  }

  loadStaff(id: number): void {
    this.staffService.getById(id).subscribe({
      next: (data) => {
        this.staffForm.patchValue({
          fullName: data.fullName,
          email:    data.email,
          phone:    data.phone,
          role:     data.role,
          status:   data.status
        });
      },
      error: () => {
        this.toast.error('Failed to load staff data');
        this.router.navigate(['/staff']);
      }
    });
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields!');
      return;
    }

    this.isLoading  = true;
    const formData  = this.staffForm.value;

    // Edit mode mein agar password empty hai to remove karo
    if (this.isEditMode && !formData.password) {
      delete formData.password;
    }

    const request = this.isEditMode
      ? this.staffService.update(this.staffId!, formData)
      : this.staffService.create(formData);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success(this.isEditMode ? 'Staff updated!' : 'Staff added!');
        this.router.navigate(['/staff']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'Something went wrong!');
      }
    });
  }

  get f() { return this.staffForm.controls; }
}