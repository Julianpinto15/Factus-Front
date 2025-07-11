import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthResponse } from '../interface/AuthResponse';
import { RegisterRequest } from '../interface/RegisterRequest';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
// Importaciones faltantes

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrlProduction;
  isAuthenticated = signal(false);

  private http = inject(HttpClient);
  private auth = inject(Auth);

  // Configuración común de headers CON token
  private getCommonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${this.getAccessToken()}`,
    });
  }

  // Configuración común de headers SIN token
  private getBaseHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  login(credentials: {
    username: string;
    password: string;
  }): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    });

    const body = new URLSearchParams();
    body.set('username', credentials.username);
    body.set('password', credentials.password);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/oauth/token`, body.toString(), {
        headers,
      })
      .pipe(
        tap((response) => {
          this.setTokens(response);
          this.isAuthenticated.set(true);
        }),
        catchError((error) => {
          console.error('Error en login:', error);
          return throwError(() => new Error('Error al autenticar con Factus'));
        })
      );
  }

  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      const body = {
        email: user.email,
        idToken: await user.getIdToken(),
      };

      // No enviar Authorization header cuando pedimos el token por primera vez
      return this.http
        .post<AuthResponse>(`${this.apiUrl}/auth/google`, body, {
          headers: this.getBaseHeaders(),
        })
        .pipe(
          tap((response) => {
            this.setTokens(response);
            this.isAuthenticated.set(true);
          }),
          catchError((error) => {
            console.error('Error en login con Google:', error);
            return throwError(
              () => new Error(error.error?.message || 'Error con Google')
            );
          })
        )
        .toPromise() as Promise<AuthResponse>;
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw new Error('Error al iniciar sesión con Google');
    }
  }

  register(data: RegisterRequest): Observable<any> {
    // También usar getBaseHeaders() aquí porque no necesita token
    return this.http
      .post(`${this.apiUrl}/register`, data, {
        headers: this.getCommonHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error en registro:', error);
          return throwError(
            () => new Error(error.error?.message || 'Error en registro')
          );
        })
      );
  }

  private setTokens(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('expires_in', response.expires_in.toString());
    localStorage.setItem('token_type', response.token_type);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('token_type');
    this.isAuthenticated.set(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isTokenExpired(): boolean {
    const expiresIn = localStorage.getItem('expires_in');
    if (!expiresIn) return true;
    const expirationTime = parseInt(expiresIn, 10) * 1000 + Date.now();
    return Date.now() >= expirationTime;
  }
}
