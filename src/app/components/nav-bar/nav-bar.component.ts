import {Component} from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import {ComponentRoutes} from "../../config/routes";
import {UserDetail} from "../../models/user-detail.model";
import {UserService} from "../../services/user.service";
import {AuthenticatedUser} from "../../models/authentication/authenticated-user.model";

@Component({
    selector: 'app-nav-bar',
    imports: [
        NgbDropdown,
        NgbDropdownMenu,
        NgbDropdownItem,
        NgbDropdownToggle
    ],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.scss',
    standalone: true,
    providers: [UserService]
})
export class NavBarComponent {
    private currentUser: UserDetail;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly userService: UserService,
        private readonly router: Router
    ) {
        const authenticatedUser: AuthenticatedUser | null = this.authenticationService.getAuthenticatedUser();
        if (authenticatedUser) {
            userService.getUser(authenticatedUser.userId)
                .subscribe((user: UserDetail) => this.currentUser = user);
        }
    }

    getFirstName(): string | undefined {
        return this.currentUser?.firstName;
    }

    getLastName(): string | undefined {
        return this.currentUser?.lastName
    }

    isAuthenticated(): boolean {
        return this.authenticationService.isAuthenticated();
    }

    logout(): void {
        this.authenticationService.logout();
        this.router.navigate([ComponentRoutes.LOGIN]).then();
    }
}

