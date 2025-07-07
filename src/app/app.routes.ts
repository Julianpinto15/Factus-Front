import { Routes } from '@angular/router';

import { LoginComponent } from './auth/page/login/login.component';
import { DashboardComponent } from './page/dashboard/page/dashboard-main/dashboard.component';
import { CustomerComponent } from './page/customer/page/customer/customer.component';
import { CustomerListComponent } from './page/customer/page/customer-list/customer-list.component';
import { CustomerCreateComponent } from './page/customer/page/customer-create/customer-create.component';
import { ProductComponent } from './page/product/page/product/product.component';
import { ProductListComponent } from './page/product/page/product-list/product-list.component';
import { ProductCreateComponent } from './page/product/page/product-create/product-create.component';
import { InvoiceCreateComponent } from './page/invoice/page/invoice-create/invoiceCreate.component';
import { InvoiceListComponent } from './page/invoice/page/invoice-list/invoice-list.component';
import { InvoiceDetailComponent } from './page/invoice/page/invoice-detail/invoice-detail.component';
import { InvoiceComponent } from './page/invoice/page/invoice/invoice.component';
import { ProductEditComponent } from './page/product/components/product-edit/product-edit.component';
import { CustomerEditComponent } from './page/customer/components/customer-edit/customer-edit.component';

export const routes: Routes = [
  // Ruta raíz redirige
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Ruta de login
  { path: 'login', component: LoginComponent },

  // Rutas del dashboard
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
          { path: 'edit/:id', component: CustomerEditComponent },
        ],
      },
      {
        path: 'product',
        component: ProductComponent,
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: ProductListComponent },
          { path: 'create', component: ProductCreateComponent },
          { path: 'edit/:id', component: ProductEditComponent },
        ],
      },
      {
        path: 'invoice',
        component: InvoiceComponent,
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: InvoiceListComponent },
          { path: 'create', component: InvoiceCreateComponent },
          {
            path: 'detail/:invoiceNumber',
            component: InvoiceDetailComponent,
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
