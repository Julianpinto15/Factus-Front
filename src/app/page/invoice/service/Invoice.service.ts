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
import { PaginatedResponse } from '../interface/PaginatedResponse';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl; // Base URL: e.g., 'https://api-sandbox.factus.com.co'
  private readonly apiUrlLocal = `http://localhost:8080`;

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
      .post(`${this.apiUrlLocal}/v1/bills/validate`, invoice, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error creating invoice:', error);
          return throwError(() => error);
        })
      );
  }

  getInvoices(page: number, size: number): Observable<PaginatedResponse> {
    return this.http
      .get<PaginatedResponse>(
        `${this.apiUrlLocal}/v1/bills/validate/paginated?page=${page}&size=${size}`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching invoices:', error);
          return throwError(() => error);
        })
      );
  }

  getInvoiceByNumber(number: string): Observable<any> {
    return this.http
      .get(`${this.apiUrlLocal}/v1/bills/show/${number}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching invoice:', error);
          return throwError(() => error);
        })
      );
  }

  downloadInvoicePdf(number: string): Observable<Blob> {
    return this.http
      .get(`${this.apiUrlLocal}/v1/bills/download-pdf/${number}`, {
        headers: this.getHeaders(),
        responseType: 'blob',
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error downloading PDF:', error);
          return throwError(() => error);
        })
      );
  }

  downloadInvoiceXml(number: string): Observable<Blob> {
    return this.http
      .get(`${this.apiUrlLocal}/v1/bills/download-xml/${number}`, {
        headers: this.getHeaders(),
        responseType: 'blob',
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error downloading XML:', error);
          return throwError(() => error);
        })
      );
  }
}
