import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthenticatedUser} from '../models/authentication/authenticated-user.model';
import {AuthenticationService} from '../services/authentication.service';
import {environment} from "../../environments/environment";
import {URI_PREFIX} from "../config/routes";
import { AppEnvironmentService } from '../services/apiEnvironment.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

    constructor(private readonly authenticationService: AuthenticationService,
                private readonly appEnvService: AppEnvironmentService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authenticatedUser: AuthenticatedUser | null = this.authenticationService.getAuthenticatedUser();
        let headers: HttpHeaders = request.headers;
        let fullUrl : string = `${this.appEnvService.getApiUrl()}/${URI_PREFIX}/${request.url}`;
        headers = headers.set('Authorization', `Bearer ${authenticatedUser?.token}`);
        const updatedRequest = request.clone({
            url: fullUrl,
            headers: headers
        });
        return next.handle(updatedRequest);
    }
}