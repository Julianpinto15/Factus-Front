import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  signal,
} from '@angular/core';

@Component({
  selector: 'button-registration',
  imports: [],
  templateUrl: './button-registration.component.html',
  styleUrl: './button-registration.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonRegistrationComponent {
  @Output() registerClick = new EventEmitter<void>();

  onRegisterClick() {
    this.registerClick.emit();
  }
}
