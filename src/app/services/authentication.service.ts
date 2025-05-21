import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {USER_AUTHENTICATION_TOKEN_KEY as AUTHENTICATED_USER_KEY,USER_AUTHENTICATION_PRODUCTION_TOKEN_KEY as AUTHENTICATED_PROD_USER_KEY} from '../config/constants';
import {AuthenticatedUser} from '../models/authentication/authenticated-user.model';
import {Role} from '../models/authentication/role.model';
import {UserAuthentication} from '../models/authentication/user-credentials.model';
import {DecodedToken} from '../interfaces/decoded-token.interface';
import {AuthenticationResponse} from '../models/authentication/authentication-response.model';
import { AppEnvironmentService } from './apiEnvironment.service';


@Injectable()
export class AuthenticationService {
    private readonly jwtHelperService: JwtHelperService = new JwtHelperService();
    private authenticatedUser: AuthenticatedUser | null;
    private decodedToken: DecodedToken | null;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly apiEnvironmentService: AppEnvironmentService
    ) {
        this.setAuthenticatedUserFromStorage();
        this.apiEnvironmentService.getAppEnvNotifier().subscribe(() => this.setTokenKey());
    }
    setTokenKey(): void {
        let isProd = this.apiEnvironmentService.getIsProdValue();
        if(isProd){
            localStorage.setItem(AUTHENTICATED_PROD_USER_KEY, JSON.stringify(this.authenticatedUser));
        }else {
            localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(this.authenticatedUser));
        }
        this.setAuthenticatedUserFromStorage();
    }


    authenticate(userAuthentication: UserAuthentication): Observable<AuthenticationResponse> {
        return this.httpClient.post<AuthenticationResponse>('users/authenticate', userAuthentication)
            .pipe(
                tap((authenticationResponse: AuthenticationResponse) => {
                    this.setAuthenticatedUser(authenticationResponse);
                })
            )
    }

    logout(): void {
        localStorage.removeItem(AUTHENTICATED_PROD_USER_KEY);
        localStorage.removeItem(AUTHENTICATED_USER_KEY);
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
        this.authenticatedUser = new AuthenticatedUser();
        this.authenticatedUser.userId = authenticationResponse.userId;
        this.authenticatedUser.token = authenticationResponse.accessToken.token;
        this.setDecodedToken();
        this.setTokenKey();
    }

    private setAuthenticatedUserFromStorage(): void {
        let isProd = this.apiEnvironmentService.getIsProdValue();
        let authenticatedUserJSON: string | null = localStorage.getItem(isProd ? AUTHENTICATED_PROD_USER_KEY  : AUTHENTICATED_USER_KEY);
        if (authenticatedUserJSON) {
            this.authenticatedUser = JSON.parse(authenticatedUserJSON);
            this.setDecodedToken();
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
}