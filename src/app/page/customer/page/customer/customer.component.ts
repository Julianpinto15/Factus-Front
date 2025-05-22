import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';

@Component({
  selector: 'app-customer',
  imports: [HeaderComponent],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerComponent {}
