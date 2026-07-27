import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicineService } from 'src/app/core/services/medicine.service';
import { VendorService } from 'src/app/core/services/vendor.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-medicine-form',
  templateUrl: './medicine-form.component.html',
  styleUrls: ['./medicine-form.component.css']
})
export class MedicineFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  medicineId!: number;
  vendors: any[] = [];
  units = ['Tablet', 'Syrup', 'Injection', 'Capsule', 'Ointment', 'Drops'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medicineService: MedicineService,
    private vendorService: VendorService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      genericName: [''],
      category: [''],
      unit: ['Tablet', Validators.required],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [10, [Validators.required, Validators.min(0)]],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      expiryDate: [''],
      vendorId: [null]
    });

    this.vendorService.getAll().subscribe({ next: (res) => this.vendors = res });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.medicineId = +id;
      this.medicineService.getById(this.medicineId).subscribe({
        next: (m) => {
          this.form.patchValue(m);
          this.form.get('stockQuantity')?.disable(); // edit mein stock adjust-stock se hoga
        },
        error: () => this.toast.error('Failed to load medicine')
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const data = this.form.getRawValue();

    if (this.isEdit) {
      this.medicineService.update(this.medicineId, data).subscribe({
        next: () => { this.toast.success('Medicine updated!'); this.router.navigate(['/pharmacy/medicines']); },
        error: () => this.toast.error('Update failed')
      });
    } else {
      this.medicineService.create(data).subscribe({
        next: () => { this.toast.success('Medicine added!'); this.router.navigate(['/pharmacy/medicines']); },
        error: () => this.toast.error('Create failed')
      });
    }
  }

  cancel(): void { this.router.navigate(['/pharmacy/medicines']); }
}