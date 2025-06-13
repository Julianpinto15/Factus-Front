import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { AuthService } from '../../../auth/service/auth.service';
import { Invoice } from '../interface/Invoice';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/v1/bills/validate`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  createInvoice(invoice: Invoice): Observable<any> {
    return this.http
      .post(this.apiUrl, invoice, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud:', error);
          return throwError(() => error);
        })
      );
  }
}
