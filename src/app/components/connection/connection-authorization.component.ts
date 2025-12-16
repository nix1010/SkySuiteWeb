import {HttpClient} from '@angular/common/http';
import {AfterContentInit, Component} from '@angular/core';
import Nango, {ConnectUIEvent} from "@nangohq/frontend";
import {ActivatedRoute} from "@angular/router";
import {NgIf} from "@angular/common";
import {LoadSpinnerComponent} from "../load-spinner/load-spinner.component";

@Component({
    selector: 'app-connection-authorization',
    imports: [
        NgIf,
        LoadSpinnerComponent
    ],
    templateUrl: './connection-authorization.component.html',
    styleUrl: './connection-authorization.component.scss'
})
export class ConnectionAuthorizationComponent implements AfterContentInit {
    private readonly nango: Nango
    protected isLoading: boolean = true;
    protected isConnectionSuccess: boolean;
    protected isConnectionCanceled: boolean;
    protected errorMessage: string;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly httpClient: HttpClient
    ) {
        this.nango = new Nango();
    }

    ngAfterContentInit(): void {
        const sessionToken: string | null = this.route.snapshot.queryParamMap.get("sessionToken");
        if (!sessionToken) {
            this.errorMessage = "No session token found.";
            this.isLoading = false;
            return;
        }

        const statusCallbackUri: string | null = this.route.snapshot.queryParamMap.get("statusCallbackUri");

        this.nango.openConnectUI({
            sessionToken: sessionToken,
            onEvent: (event: ConnectUIEvent) => this.onConnectEvent(event, statusCallbackUri)
        });
    }

    private onConnectEvent(event: ConnectUIEvent, statusCallbackUri: string | null): void {
        if (event.type === 'ready') {
            this.isLoading = false;
        } else {
            if (statusCallbackUri) {
                this.httpClient.post(statusCallbackUri, {eventType: event.type}).subscribe();
            }
            
            if (event.type === 'connect') {
                this.isConnectionSuccess = true;
            } else if (event.type === 'close') {
                this.isConnectionCanceled = true;
            } else if (event.type === 'error') {
                this.errorMessage = 'An error occurred during authorization. Please try again or contact support if the issue persists.';
            }
        }
    }
}
