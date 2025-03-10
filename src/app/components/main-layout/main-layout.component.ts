import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {NavBarComponent} from "../nav-bar/nav-bar.component";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './main-layout.component.html',
  standalone: true,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

}
