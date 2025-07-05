import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LegalOrganization } from '../interface/LegalOrganization';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../../auth/service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LegalOrganizatioService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrlProduction}/api/legal-organizations`;
  private legalOrganizations = signal<LegalOrganization[]>([]);

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
