import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

function dvValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === '') return null;
  return value >= 0 && value <= 9 ? null : { max: true };
}

@Component({
  selector: 'app-customer-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatAutocompleteModule,
  ],
  templateUrl: './customer-edit.component.html',
  styleUrl: './customer-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerEditComponent {}
