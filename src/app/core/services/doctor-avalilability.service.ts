import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DoctorAvailability {
  id: number;
  doctorId: number;
  doctorName: string;
  dayOfWeek: string;
  startTime: string;   // "09:00:00"
  endTime: string;     // "17:00:00"
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface DoctorAvailabilityCreate {
  doctorId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface AvailableSlot {
  time: string;
  isBooked: boolean;
}

@Injectable({ providedIn: 'root' })
export class DoctorAvailabilityService {
  constructor(private api: ApiService) {}

  getByDoctor(doctorId: number): Observable<DoctorAvailability[]> {
    return this.api.get<DoctorAvailability[]>(`doctoravailability/doctor/${doctorId}`);
  }

  create(dto: DoctorAvailabilityCreate): Observable<any> {
    return this.api.post<any>('doctoravailability', dto);
  }

  update(id: number, dto: DoctorAvailabilityCreate): Observable<any> {
    return this.api.put<any>(`doctoravailability/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`doctoravailability/${id}`);
  }

  getSlots(doctorId: number, date: string): Observable<AvailableSlot[]> {
    return this.api.get<AvailableSlot[]>(`doctoravailability/doctor/${doctorId}/slots`, { date });
  }
}