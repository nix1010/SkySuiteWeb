import {Component} from '@angular/core';
import {Location} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-error-page',
    imports: [
        RouterLink
    ],
    templateUrl: './error-page.component.html',
    styleUrl: './error-page.component.scss',
    standalone: true
})
export class ErrorPageComponent {
    public errorCode: string | null = null;
    private static readonly NOT_FOUND: string = '404';

    constructor(private readonly location: Location) {
        const state: any = this.location.getState();

        if (state?.errorCode) {
            this.errorCode = state.errorCode;
        }

        if (this.errorCode === null) {
            this.errorCode = ErrorPageComponent.NOT_FOUND;
        }
    }

    getMessage(): string {
        if (this.errorCode == ErrorPageComponent.NOT_FOUND) {
            return 'The page you are looking for was not found.';
        }
        return 'Unknown error occurred';
    }
}
