import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {AuthenticationService} from './authentication.service';
import {ComponentRoutes} from "../config/routes";

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly router: Router
    ) { }

    canActivate(_routeSnapshot: ActivatedRouteSnapshot, stateSnapshot: RouterStateSnapshot): boolean {
        if (this.authenticationService.isAuthenticated()) {
            return true;
        }

        this.router.navigate([ComponentRoutes.LOGIN], {state: {requestedUrl: stateSnapshot.url}}).then();

        return false;
    }
}