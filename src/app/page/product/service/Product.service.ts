import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../../auth/service/auth.service';
import { environment } from '../../../../environments/environment';

import { catchError, Observable, tap, throwError } from 'rxjs';
import { PaginatedResponse, Product } from '../interface/Product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `http://localhost:8080/api/products`;
  private products = signal<Product[]>([]);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProducts(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http
      .get<PaginatedResponse>(this.apiUrl, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        tap((response) => {
          console.log('Fetched products:', response);
          this.products.set(response.data); // Set only the data (array of products)
        }),
        catchError((error) => {
          console.error('Error fetching products:', error);
          return throwError(() => new Error('Failed to fetch products'));
        })
      );
  }

  getProductById(id: number): Observable<Product> {
    return this.http
      .get<Product>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error('Error fetching product:', error);
          return throwError(() => new Error('Failed to fetch product'));
        })
      );
  }

  getProductByCode(code: string): Observable<Product> {
    return this.http
      .get<Product>(`${this.apiUrl}/code/${code}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching product by code:', error);
          return throwError(() => new Error('Failed to fetch product by code'));
        })
      );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http
      .post<Product>(this.apiUrl, product, { headers: this.getHeaders() })
      .pipe(
        tap((newProduct) => {
          this.products.update((products) => [...products, newProduct]);
        }),
        catchError((error) => {
          console.error('Error creating product:', error);
          return throwError(() => new Error('Failed to create product'));
        })
      );
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http
      .put<Product>(`${this.apiUrl}/${id}`, product, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((updatedProduct) => {
          this.products.update((products) =>
            products.map((p) => (p.id === id ? updatedProduct : p))
          );
        }),
        catchError((error) => {
          console.error('Error updating product:', error);
          return throwError(() => new Error('Failed to update product'));
        })
      );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.products.update((products) =>
            products.filter((p) => p.id !== id)
          );
        }),
        catchError((error) => {
          console.error('Error deleting product:', error);
          return throwError(() => new Error('Failed to delete product'));
        })
      );
  }

  getProductsSignal() {
    return this.products.asReadonly();
  }
}
