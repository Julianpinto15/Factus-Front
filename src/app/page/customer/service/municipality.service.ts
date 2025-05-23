import { Injectable, signal } from '@angular/core';
import { Municipality } from '../interface/Municipality';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth/service/auth.service';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MunicipalityService {
  private apiUrl = `${environment.apiUrl}/api/municipalities`; // Endpoint del backend
  private municipalities = signal<Municipality[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getMunicipalities(): Observable<Municipality[]> {
    return this.http
      .get<Municipality[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(tap((municipalities) => this.municipalities.set(municipalities)));
  }

  getMunicipalitiesSignal() {
    return this.municipalities.asReadonly();
  }
}
