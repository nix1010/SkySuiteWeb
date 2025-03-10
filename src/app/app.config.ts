import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {HttpRequestInterceptor} from "./interceptors/http-interceptor";
import {AuthenticationService} from "./services/authentication.service";
import {AuthGuardService} from "./services/auth-guard.service";
import {RoleGuardService} from "./services/role-guard.service";

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        {provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true},
        AuthenticationService,
        AuthGuardService,
        RoleGuardService
    ]
};
