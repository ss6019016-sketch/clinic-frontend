import { Component, OnInit } from '@angular/core';
import { VendorService } from 'src/app/core/services/vendor.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { PermissionService } from 'src/app/core/services/permission.service';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.css']
})
export class VendorListComponent implements OnInit {
  vendors: any[] = [];
  searchText = '';
  isLoading = true;
  private searchTimeout: any;

  constructor(
    private vendorService: VendorService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.vendorService.getAll(this.searchText).subscribe({
      next: (res) => { this.vendors = res; this.isLoading = false; },
      error: () => { this.toast.error('Failed to load vendors'); this.isLoading = false; }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.load(), 400);
  }

  async delete(id: number): Promise<void> {
    const result = await this.confirm.open('Delete Vendor', 'Are you sure?', 'danger');
    if (!result) return;
    this.vendorService.delete(id).subscribe({
      next: () => { this.vendors = this.vendors.filter(v => v.id !== id); this.toast.success('Vendor deleted!'); },
      error: () => this.toast.error('Delete failed')
    });
  }
}