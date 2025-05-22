import { Routes } from '@angular/router';

import { LoginComponent } from './auth/page/login/login.component';
import { DashboardComponent } from './page/dashboard/page/dashboard-main/dashboard.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent, // layout
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./page/dashboard/page/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'customer',
        loadComponent: () =>
          import('./page/customer/page/customer/customer.component').then(
            (m) => m.CustomerComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
