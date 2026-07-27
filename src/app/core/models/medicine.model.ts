export interface Medicine {
  id: number;
  name: string;
  genericName: string;
  category: string;
  unit: string;
  stockQuantity: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate?: string;
  vendorId?: number;
  vendorName?: string;
  status: string;
  createdAt: string;
  isLowStock: boolean;
}