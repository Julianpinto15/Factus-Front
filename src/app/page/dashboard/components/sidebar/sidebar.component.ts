import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../auth/service/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  router = inject(Router);
  openDropdowns = new Set<string>();

  menuItems = [
    { id: 'home', icon: 'bxs-dashboard', text: 'Dashboard' },
    {
      id: 'customer',
      icon: 'bxs-shopping-bag-alt',
      text: 'Cliente',
      children: [
        {
          id: 'create',
          text: 'Crear Cliente',
          path: '/dashboard/customer/create',
        },
        {
          id: 'list',
          text: 'Lista de Clientes',
          path: '/dashboard/customer/list',
        },
      ],
    },
    {
      id: 'product',
      icon: 'bxs-shopping-bag-alt',
      text: 'Inventario',
      children: [
        {
          id: 'create',
          text: 'Crear Producto',
          path: '/dashboard/product/create',
        },
        {
          id: 'list',
          text: 'Lista de Productos',
          path: '/dashboard/product/list',
        },
      ],
    },
    {
      id: 'invoice',
      icon: 'bxs-message-dots',
      text: 'Factura',
      children: [
        {
          id: 'create',
          text: 'Crear factura',
          path: '/dashboard/invoice/create',
        },
        {
          id: 'list',
          text: 'Lista de factura',
          path: '/dashboard/invoice/list',
        },
      ],
    },

    { id: 'invoice/:number', icon: 'bxs-group', text: 'Listar' },
  ];

  bottomMenuItems = [
    { id: 'settings', icon: 'bxs-cog', text: 'Settings' },
    { id: 'logout', icon: 'bx-power-off', text: 'Logout', class: 'logout' },
  ];

  toggleDropdown(menuId: string) {
    if (this.openDropdowns.has(menuId)) {
      this.openDropdowns.delete(menuId);
    } else {
      this.openDropdowns.clear(); // Close other dropdowns
      this.openDropdowns.add(menuId);
    }
  }

  navigate(menuId: string, path?: string) {
    this.dashboardService.setActiveMenu(menuId);
    this.router.navigate([path || `/dashboard/${menuId}`]);
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
