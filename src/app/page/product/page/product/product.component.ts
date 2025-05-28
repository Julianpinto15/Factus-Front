import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {}
