import { inject, Injectable, signal } from '@angular/core';
import { Customer } from '../interface/Customer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth/service/auth.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrlProduction}/api/customers`;
  private customers = signal<Customer[]>([]);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getCustomers(
    page: number = 0,
    size: number = 10
  ): Observable<{ data: Customer[]; total: number }> {
    const params = { page: page.toString(), size: size.toString() };
    return this.http
      .get<{ data: Customer[]; total: number }>(this.apiUrl, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        tap((response) => {
          console.log('Backend response:', response); // Debug log
          this.customers.set(response.data);
        }),
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

  updateCustomer(
    identification: string,
    customer: Customer
  ): Observable<Customer> {
    return this.http
      .put<Customer>(`${this.apiUrl}/${identification}`, customer, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((updatedCustomer) => {
          this.customers.update((customers) =>
            customers.map((c) =>
              c.identification === identification ? updatedCustomer : c
            )
          );
        }),
        catchError((error) => {
          console.error('Error updating customer:', error);
          return throwError(() => new Error('Failed to update customer'));
        })
      );
  }

  deleteCustomer(identification: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${identification}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(() => {
          this.customers.update((customers) =>
            customers.filter((c) => c.identification !== identification)
          );
        }),
        catchError((error) => {
          console.error('Error deleting customer:', error);
          return throwError(() => new Error('Failed to delete customer'));
        })
      );
  }

  getCustomersSignal() {
    return this.customers.asReadonly();
  }
}
