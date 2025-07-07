import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login-registration',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-registration.component.html',
  styleUrl: './login-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginRegistrationComponent {
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
}
