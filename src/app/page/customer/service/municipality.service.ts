import { inject, Injectable, signal } from '@angular/core';
import { Municipality } from '../interface/Municipality';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth/service/auth.service';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MunicipalityService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrlProduction}/api/municipalities`;
  private municipalities = signal<Municipality[]>([]);

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
