import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'login-inicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-inicio.component.html',
  styleUrls: ['./login-inicio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginInicioComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  error: WritableSignal<string | null> = signal(null);
  successMessage: WritableSignal<string | null> = signal(null);
  isRegisterActive: WritableSignal<boolean> = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Formulario de login
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    // Formulario de registro
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) =>
          this.error.set(err.message || 'Error al iniciar sesión'),
      });
    } else {
      this.error.set('Por favor, completa todos los campos correctamente.');
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage.set(
            'Registro exitoso. Ahora puedes iniciar sesión.'
          );
          this.isRegisterActive.set(false); // Volver a la vista de login
        },
        error: (err) => {
          const errorMessage =
            err.status === 400
              ? 'Error en el registro: usuario ya existe'
              : err.message ||
                'Registro exitoso localmente, usa las credenciales por defecto de Factus.';
          this.error.set(errorMessage);
        },
      });
    } else {
      this.error.set('Por favor, completa todos los campos correctamente.');
    }
  }

  loginWithGoogle(): void {
    this.authService
      .loginWithGoogle()
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        this.error.set(err.message || 'Error al iniciar sesión con Google');
      });
  }

  toggleForm(): void {
    this.isRegisterActive.set(!this.isRegisterActive());
    this.error.set(null);
    this.successMessage.set(null);
  }
}
