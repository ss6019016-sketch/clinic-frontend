import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { SettingsService } from 'src/app/core/services/settings.service';
import { UploadService } from 'src/app/core/services/upload.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AuthService } from 'src/app/core/services/auth.service';

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

  currentPhoto: string | null = null;
  uploadingPhoto = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private uploadService: UploadService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();

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
      name:  [user?.name  || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: ['03001234567', Validators.required],
      role:  [{ value: user?.role || 'Admin', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Current photo load karo
    this.currentPhoto = this.uploadService.getPhotoUrl();

    // Photo changes ko subscribe karo
    this.uploadService.photo$.subscribe(
      photo => this.currentPhoto = photo
    );

    this.loadSettings();
  }

  loadSettings(): void {
    this.settingsService.get().subscribe({
      next: (data) => { if (data) this.clinicForm.patchValue(data); }
    });
  }

  // Photo select karo
  onPhotoSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // Preview immediately dikhao
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.currentPhoto = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload karo
    this.uploadingPhoto = true;
    this.uploadService.uploadProfilePhoto(file).subscribe({
      next: (res) => {
        this.uploadingPhoto = false;
        this.toast.success('Profile photo updated!');
      },
      error: (err) => {
        this.uploadingPhoto = false;
        this.currentPhoto   = this.uploadService.getPhotoUrl();
        this.toast.error(err?.error?.message || 'Upload failed!');
      }
    });
  }

  removePhoto(): void {
    this.uploadService.clearPhoto();
    this.currentPhoto = null;
    this.toast.success('Photo removed!');
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const np = control.get('newPassword')?.value;
    const cp = control.get('confirmPassword')?.value;
    return np === cp ? null : { mismatch: true };
  }

  saveClinic(): void {
    if (this.clinicForm.invalid) {
      this.clinicForm.markAllAsTouched();
      return;
    }
    this.settingsService.update(this.clinicForm.value).subscribe({
      next: () => this.toast.success('Clinic settings saved!'),
      error: () => this.toast.error('Failed to save settings')
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.toast.success('Profile updated!');
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.settingsService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.toast.success('Password changed!');
        this.passwordForm.reset();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed!')
    });
  }

  get pf() { return this.passwordForm.controls; }
}