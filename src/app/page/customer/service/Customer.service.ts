import { Injectable, signal } from '@angular/core';
import { Customer } from '../interface/Customer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth/service/auth.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/api/customers`;
  private customers = signal<Customer[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getCustomers(): Observable<Customer[]> {
    return this.http
      .get<Customer[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap((customers) => this.customers.set(customers)),
        catchError((error) => {
          console.error('Error fetching customers:', error);
          return throwError(() => new Error('Failed to fetch customers'));
        })
      );
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http
      .post<Customer>(this.apiUrl, customer, { headers: this.getHeaders() })
      .pipe(
        tap((newCustomer) => {
          // Actualizar el signal con el nuevo cliente
          this.customers.update((customers) => [...customers, newCustomer]);
        }),
        catchError((error) => {
          console.error('Error creating customer:', error);
          return throwError(() => new Error('Failed to create customer'));
        })
      );
  }

  getCustomerByIdentification(identification: string): Observable<Customer> {
    return this.http
      .get<Customer>(`${this.apiUrl}/${identification}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching customer:', error);
          return throwError(() => new Error('Failed to fetch customer'));
        })
      );
  }

  getCustomersSignal() {
    return this.customers.asReadonly();
  }
}
