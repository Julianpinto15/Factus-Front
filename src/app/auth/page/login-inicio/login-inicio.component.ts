import { Component, inject, WritableSignal, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'login-inicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SweetAlert2Module],
  templateUrl: './login-inicio.component.html',
  styleUrls: ['./login-inicio.component.scss'],
})
export class LoginInicioComponent {
  loginForm: FormGroup;
  error: WritableSignal<string | null> = signal(null);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      Swal.fire({
        title: 'Iniciando sesión...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Inicio de sesión exitoso.',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.router.navigate(['/dashboard']);
          });
        },
        error: (err) => {
          this.error.set(err.message || 'Error al iniciar sesión');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.error() ?? 'Error al iniciar sesión.', // Use nullish coalescing
            confirmButtonColor: '#7494ec',
          });
        },
      });
    } else {
      this.error.set('Por favor, completa todos los campos correctamente.');
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text:
          this.error() ?? 'Por favor, completa todos los campos correctamente.', // Use nullish coalescing
        confirmButtonColor: '#7494ec',
      });
    }
  }

  async loginWithGoogle() {
    try {
      Swal.fire({
        title: 'Iniciando sesión...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await this.authService.loginWithGoogle();
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Inicio de sesión con Google exitoso.',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        this.router.navigate(['/dashboard']);
      });
    } catch (err: any) {
      this.error.set(err.message || 'Error al iniciar sesión con Google');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.error() ?? 'Error al iniciar sesión con Google.', // Use nullish coalescing
        confirmButtonColor: '#7494ec',
      });
    }
  }
}
