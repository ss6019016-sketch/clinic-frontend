import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  activeTab = 'clinic';

  clinicForm!:   FormGroup;
  profileForm!:  FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.clinicForm = this.fb.group({
      clinicName:   ['', Validators.required],
      address:      ['', Validators.required],
      phone:        ['', Validators.required],
      email:        ['', [Validators.required, Validators.email]],
      workingHours: [''],
      website:      [''],
      description:  ['']
    });

    this.profileForm = this.fb.group({
      name:  ['Sami Shaheen', Validators.required],
      email: ['admin@clinic.com', [Validators.required, Validators.email]],
      phone: ['03001234567', Validators.required],
      role:  [{ value: 'Admin', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.loadSettings();
  }

  loadSettings(): void {
    this.settingsService.get().subscribe({
      next: (data) => {
        if (data) this.clinicForm.patchValue(data);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const np = control.get('newPassword')?.value;
    const cp = control.get('confirmPassword')?.value;
    return np === cp ? null : { mismatch: true };
  }

  saveClinic(): void {
    if (this.clinicForm.invalid) { this.clinicForm.markAllAsTouched(); return; }
    this.settingsService.update(this.clinicForm.value).subscribe({
      next: () => this.toast.success('Clinic settings saved!'),
      error: () => this.toast.error('Failed to save settings')
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.toast.success('Profile updated!');
  }

  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.settingsService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.toast.success('Password changed!');
        this.passwordForm.reset();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed to change password')
    });
  }

  get pf() { return this.passwordForm.controls; }
}