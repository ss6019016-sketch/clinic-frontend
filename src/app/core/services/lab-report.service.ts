import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LabReport {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number | null;
  doctorName: string | null;
  testName: string;
  reportDate: string;
  fileName: string;
  fileType: string;
  notes: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LabReportService {
  private base = `${environment.apiUrl}/labreports`;

  constructor(private http: HttpClient) {}

  getByPatient(patientId: number): Observable<LabReport[]> {
    return this.http.get<LabReport[]>(`${this.base}/patient/${patientId}`);
  }

  // Fetches the file as a blob through the authenticated HttpClient (a plain
  // <a href> would skip the JWT interceptor and get a 401), then hands back
  // an object URL the component can open in a new tab or trigger a download with.
  getFileBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/file`, { responseType: 'blob' });
  }

  upload(formData: FormData): Observable<any> {
    return this.http.post<any>(this.base, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/${id}`);
  }
}