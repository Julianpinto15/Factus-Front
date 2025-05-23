import { Routes } from '@angular/router';

import { LoginComponent } from './auth/page/login/login.component';
import { DashboardComponent } from './page/dashboard/page/dashboard-main/dashboard.component';
import { CustomerComponent } from './page/customer/page/customer/customer.component';
import { CustomerListComponent } from './page/customer/page/customer-list/customer-list.component';
import { CustomerCreateComponent } from './page/customer/page/customer-create/customer-create.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
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
        component: CustomerComponent,
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: CustomerListComponent },
          { path: 'create', component: CustomerCreateComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
