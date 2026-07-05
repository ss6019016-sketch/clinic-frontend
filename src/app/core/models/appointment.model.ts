export interface Appointment {
  id?: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string; // Pending, Confirmed, Completed, Cancelled
  notes?: string;
}