import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LoginInicioComponent } from '../login-inicio/login-inicio.component';
import { LoginRegistrationComponent } from '../login-registration/login-registration.component';
import { ButtonRegistrationComponent } from '../../components/button-registration/button-registration.component';
import { ButtonLoginComponent } from '../../components/button-login/button-login.component';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    LoginInicioComponent,
    LoginRegistrationComponent,
    ButtonRegistrationComponent,
    ButtonLoginComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
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
