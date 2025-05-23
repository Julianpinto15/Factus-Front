import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LegalOrganization } from '../interface/LegalOrganization';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../../auth/service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LegalOrganizatioService {
  private apiUrl = `${environment.apiUrl}/api/legal-organizations`; // Ajusta según el endpoint del backend
  private legalOrganizations = signal<LegalOrganization[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getLegalOrganizations(): Observable<LegalOrganization[]> {
    return this.http
      .get<LegalOrganization[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap((legalOrganizations) =>
          this.legalOrganizations.set(legalOrganizations)
        )
      );
  }

  getLegalOrganizationsSignal() {
    return this.legalOrganizations.asReadonly();
  }
}
