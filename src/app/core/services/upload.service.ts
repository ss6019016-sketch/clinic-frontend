import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UploadService {

  private apiUrl = environment.apiUrl;

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
          // Ab photoUrl seedha Base64 data URL hai
          // Koi backend URL add karne ki zaroorat nahi!
          localStorage.setItem('profilePhoto', res.photoUrl);
          this.profilePhoto$.next(res.photoUrl);

          const user = this.auth.getUser();
          if (user) {
            user.profilePhoto = res.photoUrl;
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