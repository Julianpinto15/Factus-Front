import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  dashboardService = inject(DashboardService);
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
        { id: 'trends', text: 'Trends', path: '/dashboard/analytics/trends' },
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
}
