import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'button-login',
  imports: [],
  templateUrl: './button-login.component.html',
  styleUrl: './button-login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonLoginComponent {
  @Output() registerClick = new EventEmitter<void>();

  onLoginClick() {
    this.registerClick.emit();
  }
}
