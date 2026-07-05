export interface Doctor {
  id?: number;
  fullName: string;
  specialization: string;
  phone: string;
  email: string;
  experience: number;
  availableDays?: string;
  fee?: number;
}