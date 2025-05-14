import {Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-alert',
  imports: [
    NgClass
  ],
  templateUrl: './alert.component.html',
  standalone: true,
  styleUrl: './alert.component.scss'
})
export class AlertComponent {
public alertResult: boolean = false;
  @Input()
  title: string = "Pending Changes";
  @Input()
  content:string = "there are some pending changes would like to save them";
  @Input()
  okContent:string = "Save Changes";
  @Input()
  closeContent:string = "Close";
  constructor() { }

  closeClick() : void{
    this.alertResult = false;
    } 
    okClick() : void{
        this.alertResult = true;
  } 
}
