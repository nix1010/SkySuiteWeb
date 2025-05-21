import {Location, NgIf} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {AuthenticationService} from '../../services/authentication.service';
import {UserAuthentication} from "../../models/authentication/user-credentials.model";
import {getErrorResponseMessage} from "../../utils/utils";
import {FormsModule} from "@angular/forms";
import { AppEnvironmentService } from '../../services/apiEnvironment.service';

@Component({
    selector: 'app-login',
    imports: [
        FormsModule,
        NgIf,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    standalone: true
})
export class LoginComponent implements OnInit {
    public user: UserAuthentication = new UserAuthentication('', '');
    public errorMessage: string | null = null;
    public loginProcess: boolean = false;

    @ViewChild('form')
    public formElement: ElementRef;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly router: Router,
        private readonly location: Location,
        private readonly api: AppEnvironmentService
    ) { }

    ngOnInit(): void {
        this.routeToPreviousPageIfAuthenticated();
    }

    authenticate(): void {
        if (!this.validateForm()) {
            return;
        }

        this.loginProcess = true;
        this.errorMessage = null;
console.log(this.api.getApiUrl())
        this.authenticationService.authenticate(this.user)
            .pipe(finalize(() => this.loginProcess = false))
            .subscribe({
                next: () => this.routeToPreviousPageIfAuthenticated(),
                error: (err: HttpErrorResponse) => this.errorMessage = getErrorResponseMessage(err)
            });
    }

    routeToPreviousPageIfAuthenticated(): void {
        if (this.authenticationService.isAuthenticated()) {
            const state: any = this.location.getState();
            let url: string = '/';

            if (state?.requestedUrl) {
                url = state.requestedUrl;
            }

            this.router.navigate([url]).then();
        }
    }

    validateForm(): boolean {
        const valid: boolean = !!this.user.email && !!this.user.password;
        this.formElement.nativeElement.classList.add('was-validated');

        return valid;
    }
}
