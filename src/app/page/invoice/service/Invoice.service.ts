import { Injectable } from '@angular/core';
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
  private apiUrl = `${environment.apiUrl}/v1/bills/validate`; // Endpoint correcto

  constructor(private http: HttpClient, private authService: AuthService) {}

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

  // En Invoice.service.ts
  createInvoice(invoice: Invoice): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`, // Ajusta según tu autenticación
    });
    return this.http.post(this.apiUrl, invoice, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en la solicitud:', error);
        console.log('Cuerpo del error:', error.error);
        console.log('Status:', error.status);
        console.log('Mensaje:', error.message);
        throw error; // Propaga el error para que el componente lo maneje
      })
    );
  }
}
