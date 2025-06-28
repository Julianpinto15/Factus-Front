import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-invoice',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceComponent {}
