import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'login-inicio',
  imports: [CommonModule],
  templateUrl: './login-inicio.component.html',
  styleUrl: './login-inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginInicioComponent {}
