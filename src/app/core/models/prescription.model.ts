export interface PrescriptionItem {
  id?: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id?: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  appointmentId?: number;
  diagnosis: string;
  notes?: string;
  followUpDate?: string;
  createdAt?: Date;
  medicines: PrescriptionItem[];
}