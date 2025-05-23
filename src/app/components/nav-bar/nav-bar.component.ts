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
        return this.currentUser?.firstName 
        ? this.currentUser.firstName.charAt(0).toUpperCase() + this.currentUser.firstName.slice(1) 
        : '';
    }

    getLastName(): string | undefined {
        return this.currentUser?.lastName 
        ? this.currentUser.lastName.charAt(0).toUpperCase() + this.currentUser.lastName.slice(1) 
        : '';
    }
    getInitialze() : string | undefined{
        if (this.currentUser?.lastName && this.currentUser?.firstName) {
            return this.currentUser.firstName.charAt(0).toUpperCase() + this.currentUser.lastName.charAt(0).toUpperCase();
        }
return '';
    }
    isAuthenticated(): boolean {
        return this.authenticationService.isAuthenticated();
    }

    logout(): void {
        this.authenticationService.logout();
        this.router.navigate([ComponentRoutes.LOGIN]).then();
    }

    setActivePage(page: string) : string{
        if(this.router.url.includes(page))
         return 'nav-link active-nav-link';
        else return 'nav-link';
    }
}

