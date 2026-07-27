import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VendorService } from 'src/app/core/services/vendor.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-vendor-form',
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.css']
})
export class VendorFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  vendorId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      contactPerson: [''],
      phone: [''],
      email: [''],
      address: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.vendorId = +id;
      this.vendorService.getById(this.vendorId).subscribe({
        next: (v) => this.form.patchValue(v),
        error: () => this.toast.error('Failed to load vendor')
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const data = this.form.value;

    const req = this.isEdit
      ? this.vendorService.update(this.vendorId, data)
      : this.vendorService.create(data);

    req.subscribe({
      next: () => { this.toast.success(`Vendor ${this.isEdit ? 'updated' : 'added'}!`); this.router.navigate(['/pharmacy/vendors']); },
      error: () => this.toast.error('Save failed')
    });
  }

  cancel(): void { this.router.navigate(['/pharmacy/vendors']); }
}