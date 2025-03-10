import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {AuthGuardService} from './auth-guard.service';
import {AuthenticationService} from "./authentication.service";

@Injectable()
export class RoleGuardService implements CanActivate {

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly authGuardService: AuthGuardService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        let canActivate: boolean = this.authGuardService.canActivate(route, _state);
        return canActivate && this.authenticationService.hasRoles(route.data['roles']);
    }
}