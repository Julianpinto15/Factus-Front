import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';
import { AuthService } from '../../../../auth/service/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './Navbar.component.html',
  styleUrl: './Navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  public dashboardService = inject(DashboardService);
  private authService = inject(AuthService); // Inyectar AuthService
  private router = inject(Router); // Inyectar Router

  profilePhotoUrl = this.authService.profilePhotoUrl;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification') && !target.closest('.profile')) {
      this.dashboardService.isNotificationMenuShown.set(false);
      this.dashboardService.isProfileMenuShown.set(false);
    }
  }

  onToggleSearchForm(event: Event): void {
    this.dashboardService.toggleSearchForm(event);
  }

  async onLogout(): Promise<void> {
    // Mostrar diálogo de confirmación con SweetAlert2
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cerrar la sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await this.authService.logout(); // Llamar al método logout
        await Swal.fire({
          title: '¡Sesión cerrada!',
          text: 'Has cerrado sesión exitosamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        this.router.navigate(['/login']); // Redirigir al login
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo cerrar la sesión. Por favor, intenta de nuevo.',
          icon: 'error',
        });
      }
    }
  }
}
