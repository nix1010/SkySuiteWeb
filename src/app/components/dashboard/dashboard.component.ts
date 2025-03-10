import {Component} from '@angular/core';
import {NavBarComponent} from "../nav-bar/nav-bar.component";
import {RouterLink} from "@angular/router";
import {ComponentRoutes} from "../../config/routes";

@Component({
    selector: 'app-dashboard',
    imports: [
        NavBarComponent,
        RouterLink
    ],
    templateUrl: './dashboard.component.html',
    standalone: true,
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

    protected readonly ComponentRoutes = ComponentRoutes;
}
