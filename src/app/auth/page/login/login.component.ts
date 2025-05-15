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

import { LoginRegistrationComponent } from '../login-registration/login-registration.component';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    LoginInicioComponent,
    ReactiveFormsModule,
    // LoginRegistrationComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  registerForm: FormGroup;
  error: WritableSignal<string | null> = signal(null);
  successMessage: WritableSignal<string | null> = signal(null);

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

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage.set(
            'Registro exitoso. Ahora puedes iniciar sesión.'
          );
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const errorMessage =
            err.status === 400
              ? 'Error en el registro: usuario ya existe'
              : err.message ||
                'Error en el registro. Contacta al administrador para activar tu cuenta.';
          this.error.set(errorMessage);
        },
      });
    } else {
      this.error.set('Por favor, completa todos los campos correctamente.');
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
