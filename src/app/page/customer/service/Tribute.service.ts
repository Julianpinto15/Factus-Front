import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Tribute } from '../interface/Tribute';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth/service/auth.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TributeService {
  private apiUrl = `${environment.apiUrl}/api/tributes`; // Ajusta según el endpoint del backend
  private tributes = signal<Tribute[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getTributes(): Observable<Tribute[]> {
    return this.http
      .get<Tribute[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(tap((tributes) => this.tributes.set(tributes)));
  }

  getTributesSignal() {
    return this.tributes.asReadonly();
  }
}
