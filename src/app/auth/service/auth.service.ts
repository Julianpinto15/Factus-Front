import { inject, Injectable, signal } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, lastValueFrom, Observable, tap, throwError } from 'rxjs';
import { AuthResponse } from '../interface/AuthResponse';
import { RegisterRequest } from '../interface/RegisterRequest';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';
import { environment } from '../../../environments/environment';
// Importaciones faltantes

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrlProduction;
  public isAuthenticated = signal(false);
  public profilePhotoUrl = signal<string | null>(null);

  private http = inject(HttpClient);
  private auth = inject(Auth);

  constructor() {
    this.checkAuthState();
  }

  private checkAuthState(): void {
    try {
      const token = this.getAccessToken();
      const photoUrl = localStorage.getItem('profile_photo_url');

      if (token && !this.isTokenExpired()) {
        this.isAuthenticated.set(true);
        this.profilePhotoUrl.set(photoUrl);
      } else {
        // Token expirado o no existe
        this.clearAuthState();

        // Solo redirigir si no estamos ya en la página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Error al verificar estado de autenticación:', error);
      this.clearAuthState();

      // Redirigir a login en caso de error
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  login(credentials: {
    username: string;
    password: string;
  }): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    });

    // Usar las credenciales por defecto de environment para Factus
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', environment.clientId);
    body.set('client_secret', environment.clientSecret);
    body.set('username', environment.email || '');
    body.set('password', environment.password || '');

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/oauth/token`, body.toString(), {
        headers,
      })
      .pipe(
        tap((response) => {
          this.setTokens(response);
          this.isAuthenticated.set(true);
          this.profilePhotoUrl.set(null); // No se guarda la foto de perfil por defecto
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

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });

      const body = {
        email: user.email,
        idToken: await user.getIdToken(),
      };

      return await lastValueFrom(
        this.http
          .post<AuthResponse>(`${this.apiUrl}/auth/google`, body, { headers })
          .pipe(
            tap((response) => {
              this.setTokens(response);
              this.isAuthenticated.set(true);
              // Guardar la foto de perfil de Google
              this.profilePhotoUrl.set(user.photoURL);
              if (user.photoURL) {
                localStorage.setItem('profile_photo_url', user.photoURL);
              }
            }),
            catchError((error) => {
              console.error('Error en login con Google:', error);
              return throwError(
                () => new Error('Error al iniciar sesión con Google')
              );
            })
          )
      );
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw new Error('Error al iniciar sesión con Google');
    }
  }

  register(data: RegisterRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    });

    const body = new URLSearchParams();
    body.set('username', data.username);
    body.set('email', data.email);
    body.set('password', data.password);

    // El backend registrará el email localmente y usará las credenciales por defecto de Factus
    return this.http
      .post(`${this.apiUrl}/register`, body.toString(), { headers })
      .pipe(
        tap(() => {
          // No autenticamos inmediatamente; el backend manejará el token
        }),
        catchError((error) => {
          console.error('Error en registro:', error);
          return throwError(() => new Error('Error en el registro'));
        })
      );
  }

  async logout(): Promise<void> {
    try {
      // Cerrar sesión en Firebase si el usuario está autenticado con Google
      if (this.auth.currentUser) {
        await signOut(this.auth);
      }
    } catch (error) {
      console.error('Error al cerrar sesión en Firebase:', error);
    } finally {
      // Limpiar tokens locales y actualizar estado
      this.clearAuthState();

      // Redirigir al login
      window.location.href = '/login';

      console.log('Sesión cerrada exitosamente');
    }
  }

  private setTokens(response: AuthResponse): void {
    try {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('expires_in', response.expires_in.toString());
      localStorage.setItem('token_type', response.token_type);

      // Guardar timestamp de cuando se obtuvo el token
      localStorage.setItem('token_obtained_at', Date.now().toString());
    } catch (error) {
      console.error('Error al guardar tokens:', error);
    }
  }

  private clearTokens(): void {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_in');
      localStorage.removeItem('token_type');
      localStorage.removeItem('token_obtained_at');
      localStorage.removeItem('profile_photo_url');
    } catch (error) {
      console.error('Error al limpiar tokens:', error);
    }
  }

  getAccessToken(): string | null {
    try {
      return localStorage.getItem('access_token');
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  isTokenExpired(): boolean {
    try {
      const expiresIn = localStorage.getItem('expires_in');
      const tokenObtainedAt = localStorage.getItem('token_obtained_at');

      if (!expiresIn || !tokenObtainedAt) {
        return true;
      }

      const expirationTime =
        parseInt(tokenObtainedAt, 10) + parseInt(expiresIn, 10) * 1000;
      const now = Date.now();

      // Agregar un margen de 5 minutos para evitar problemas de sincronización
      const bufferTime = 5 * 60 * 1000; // 5 minutos en milisegundos

      return now >= expirationTime - bufferTime;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true;
    }
  }

  private clearAuthState(): void {
    this.clearTokens();
    this.isAuthenticated.set(false);
    this.profilePhotoUrl.set(null);
  }

  getProfilePhotoUrl(): string | null {
    return this.profilePhotoUrl();
  }
}
