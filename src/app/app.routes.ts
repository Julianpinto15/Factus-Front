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
      {
        path: 'product',
        component: ProductComponent,
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list', component: ProductListComponent },
          { path: 'create', component: ProductCreateComponent },
        ],
      },
      {
        path: 'invoice',
        component: InvoiceCreateComponent,
      },
      {
        path: 'invoice/list',
        component: InvoiceListComponent,
      },

      { path: 'invoice/:number', component: InvoiceDetailComponent },

      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
