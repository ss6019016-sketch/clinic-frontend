import { Component, OnInit } from '@angular/core';
import { Appointment } from 'src/app/core/models/appointment.model';

@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.css']
})
export class AppointmentCalendarComponent implements OnInit {

  // Abhi simple list-by-date view hai (real calendar library baad mein add karenge)
  appointments: Appointment[] = [
    { id: 1, patientId: 1, patientName: 'Ali Khan', doctorId: 1, doctorName: 'Dr. Ahmed Raza', appointmentDate: '2026-07-01', appointmentTime: '10:00 AM', status: 'Confirmed' },
    { id: 2, patientId: 2, patientName: 'Sara Ahmed', doctorId: 2, doctorName: 'Dr. Fatima Noor', appointmentDate: '2026-07-01', appointmentTime: '11:30 AM', status: 'Pending' },
    { id: 3, patientId: 1, patientName: 'Ali Khan', doctorId: 2, doctorName: 'Dr. Fatima Noor', appointmentDate: '2026-07-02', appointmentTime: '09:00 AM', status: 'Confirmed' }
  ];

  groupedDates: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.groupedDates = [...new Set(this.appointments.map(a => a.appointmentDate))];
  }

  getAppointmentsByDate(date: string): Appointment[] {
    return this.appointments.filter(a => a.appointmentDate === date);
  }
}