import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UploadService {

  private apiUrl = environment.apiUrl;

  // Ye reactive hai — jab bhi photo change ho, sab jagah update ho
  private profilePhoto$ = new BehaviorSubject<string | null>(
    localStorage.getItem('profilePhoto')
  );

  photo$ = this.profilePhoto$.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

uploadProfilePhoto(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<any>(
    `${this.apiUrl}/upload/profile-photo`, formData
  ).pipe(
    tap(res => {
      if (res.photoUrl) {
        // ✅ YE CHANGE KARO
        const fullUrl = `https://clinic-backend-production-a4f0.up.railway.app${res.photoUrl}`;
        localStorage.setItem('profilePhoto', fullUrl);
        this.profilePhoto$.next(fullUrl);

        const user = this.auth.getUser();
        if (user) {
          user.profilePhoto = fullUrl;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    })
  );
}
  getPhotoUrl(): string | null {
    return localStorage.getItem('profilePhoto');
  }

  setPhoto(url: string): void {
    localStorage.setItem('profilePhoto', url);
    this.profilePhoto$.next(url);
  }

  clearPhoto(): void {
    localStorage.removeItem('profilePhoto');
    this.profilePhoto$.next(null);
  }
}