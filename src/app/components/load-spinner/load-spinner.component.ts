import {Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-load-spinner',
  imports: [
    NgClass
  ],
  templateUrl: './load-spinner.component.html',
  standalone: true,
  styleUrl: './load-spinner.component.scss'
})
export class LoadSpinnerComponent {

  @Input()
  size: string;

  constructor() { }
}

