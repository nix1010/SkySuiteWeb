import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Observable, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {USER_AUTHENTICATION_TOKEN_KEY as AUTHENTICATED_USER_KEY,USER_AUTHENTICATION_PRODUCTION_TOKEN_KEY as AUTHENTICATED_PROD_USER_KEY} from '../config/constants';
import {AuthenticatedUser} from '../models/authentication/authenticated-user.model';
import {Role} from '../models/authentication/role.model';
import {UserAuthentication} from '../models/authentication/user-credentials.model';
import {DecodedToken} from '../interfaces/decoded-token.interface';
import {AuthenticationResponse} from '../models/authentication/authentication-response.model';
import { AppEnvironmentService } from './apiEnvironment.service';
import { Router } from '@angular/router';
import {ComponentRoutes} from "../config/routes";
import { UserDetail } from '../models/user-detail.model';

@Injectable()
export class AuthenticationService {
    private readonly jwtHelperService: JwtHelperService = new JwtHelperService();
    private authenticatedUser: AuthenticatedUser | null;
    private decodedToken: DecodedToken | null;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly apiEnvironmentService: AppEnvironmentService,
        private readonly router: Router
    ) {
        this.setAuthenticatedUserFromStorage();
        this.apiEnvironmentService.getAppEnvNotifier().subscribe(() => this.setTokenKey());
    }
    setTokenKey(): void {
        this.setAuthenticatedUserFromStorage();
        this.checkAuthentication();
    }


    authenticate(userAuthentication: UserAuthentication): Observable<AuthenticationResponse> {
        return this.httpClient.post<AuthenticationResponse>('users/authenticate', userAuthentication).pipe(
            switchMap((authResponse: AuthenticationResponse) => {
              this.setAuthenticatedUser(authResponse);
              return this.httpClient.get<UserDetail>(`users/${authResponse.userId}`).pipe(
                map(() => authResponse),
                catchError(err => {
                  return throwError(() => err);
                })
              )
            }),
            tap(authResponse => {
                let isProd = this.apiEnvironmentService.getIsProdValue();
                this.logout(isProd,!isProd);
                this.setAuthenticatedUser(authResponse);
            })
          );
    }
    logout(removeProd: boolean = true,removeDev: boolean = true): void {
        if(removeProd){
            localStorage.removeItem(AUTHENTICATED_PROD_USER_KEY);
        }
        if(removeDev){
            localStorage.removeItem(AUTHENTICATED_USER_KEY);
        }
        this.authenticatedUser = null;
        this.decodedToken = null;
    }

    isAuthenticated(): boolean {
        if (this.authenticatedUser) {
            return !this.jwtHelperService.isTokenExpired(this.authenticatedUser.token);
        }

        return false;
    }

    private setAuthenticatedUser(authenticationResponse: AuthenticationResponse): void {
        let isProd = this.apiEnvironmentService.getIsProdValue();
        this.authenticatedUser = new AuthenticatedUser();
        this.authenticatedUser.userId = authenticationResponse.userId;
        this.authenticatedUser.token = authenticationResponse.accessToken.token;
        this.setDecodedToken();
        localStorage.setItem(isProd ? AUTHENTICATED_PROD_USER_KEY : AUTHENTICATED_USER_KEY, JSON.stringify(this.authenticatedUser));
    }

    private setAuthenticatedUserFromStorage(): void {
        let isProd = this.apiEnvironmentService.getIsProdValue();
        let authenticatedUserJSON: string | null = localStorage.getItem(isProd ? AUTHENTICATED_PROD_USER_KEY  : AUTHENTICATED_USER_KEY);
        console.log(authenticatedUserJSON)
        if (authenticatedUserJSON) {
            this.authenticatedUser = JSON.parse(authenticatedUserJSON);
            this.setDecodedToken();
        }else {
            this.authenticatedUser = null;
        }
    }

    getAuthenticatedUser(): AuthenticatedUser | null {
        return this.authenticatedUser;
    }

    private setDecodedToken(): void {
        if (this.authenticatedUser) {
            this.decodedToken = this.jwtHelperService.decodeToken(this.authenticatedUser.token);
        }
    }

    hasRoles(roles: Role[]): boolean {
        if (this.decodedToken) {
            for (const role of roles) {
                const index: number = this.decodedToken.role.indexOf(role);
                if (index === -1) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    checkAuthentication() : void{
            if(this.authenticatedUser === null){
              this.navigateToLogin();
            }else {
                try{
                  this.httpClient.get<UserDetail>(`users/${this.authenticatedUser.userId}`);
                }catch(err){
                    let responseError = err as HttpErrorResponse;
                    if(responseError){
                        let isProd = this.apiEnvironmentService.getIsProdValue();
                        this.logout(isProd,!isProd);
                        this.navigateToLogin();
                    }
                }
            }
    }
    navigateToLogin() : void{
        this.router.navigate([ComponentRoutes.LOGIN], {
            state: { requestedUrl: this.router.url }
          });
    }
}