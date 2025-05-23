import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-customer',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerComponent {}
