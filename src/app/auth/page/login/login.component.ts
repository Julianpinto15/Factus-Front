import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { LoginInicioComponent } from '../login-inicio/login-inicio.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoginInicioComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  registerForm: FormGroup;
  error: WritableSignal<string | null> = signal(null);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      Swal.fire({
        title: 'Registrando...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Registro exitoso. Ahora puedes iniciar sesión.',
            confirmButtonColor: '#7494ec',
          }).then(() => {
            this.router.navigate(['/dashboard']);
            this.registerForm.reset();
          });
        },
        error: (err) => {
          const errorMessage =
            err.status === 400
              ? 'Error en el registro: usuario ya existe'
              : err.message ||
                'Error en el registro. Por favor, intenta de nuevo.';
          this.error.set(errorMessage);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.error() ?? 'Error en el registro.',
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
          this.error() ?? 'Por favor, completa todos los campos correctamente.',
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
        text: this.error() ?? 'Error al iniciar sesión con Google.',
        confirmButtonColor: '#7494ec',
      });
    }
  }

  // Señal para controlar el estado de la clase 'active'
  isActive = signal(false);

  // Método para activar el estado (equivalente a añadir la clase 'active')
  onRegisterClick() {
    this.isActive.set(true);
  }

  // Método para desactivar el estado (equivalente a quitar la clase 'active')
  onLoginClick() {
    this.isActive.set(false);
  }
}
