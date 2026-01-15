import {HttpContextToken, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthenticatedUser} from '../models/authentication/authenticated-user.model';
import {AuthenticationService} from '../services/authentication.service';
import {environment} from "../../environments/environment";
import {URI_PREFIX} from "../config/routes";


export const SKIP_INTERCEPTOR: HttpContextToken<boolean> = new HttpContextToken<boolean>(() => false);

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

    constructor(private readonly authenticationService: AuthenticationService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.context.get(SKIP_INTERCEPTOR)) {
            return next.handle(request);
        }

        let authenticatedUser: AuthenticatedUser | null = this.authenticationService.getAuthenticatedUser();
        let headers: HttpHeaders = request.headers;
        headers = headers.set('Authorization', `Bearer ${authenticatedUser?.token}`);

        const updatedRequest = request.clone({
            url: `${environment.apiUrl}/${URI_PREFIX}/${request.url}`,
            headers: headers
        });
        return next.handle(updatedRequest);
    }
}
