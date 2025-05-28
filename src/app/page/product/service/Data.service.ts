import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../../auth/service/auth.service';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { UnitMeasure } from '../interface/UnitMeasure';
import { StandardCode } from '../interface/StandardCode';
import { Tribute } from '../interface/Tribute';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/api`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUnitMeasures(): Observable<UnitMeasure[]> {
    return this.http
      .get<UnitMeasure[]>(`${this.apiUrl}/unit-measures`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching unit measures:', error);
          return throwError(() => new Error('Failed to fetch unit measures'));
        })
      );
  }

  getStandardCodes(): Observable<StandardCode[]> {
    return this.http
      .get<StandardCode[]>(`${this.apiUrl}/standard-codes`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching standard codes:', error);
          return throwError(() => new Error('Failed to fetch standard codes'));
        })
      );
  }

  getTributes(): Observable<Tribute[]> {
    return this.http
      .get<Tribute[]>(`${this.apiUrl}/tributes`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching tributes:', error);
          return throwError(() => new Error('Failed to fetch tributes'));
        })
      );
  }
}
