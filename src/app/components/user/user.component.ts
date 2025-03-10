import {Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {UserDetail} from "../../models/user-detail.model";
import {FormsModule} from "@angular/forms";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {SubscriptionService} from "../../services/subscription.service";
import {SubscriptionType} from "../../models/subscription-type.model";
import {finalize, tap} from "rxjs/operators";
import {forkJoin} from "rxjs";
import {getErrorResponseMessage} from "../../utils/utils";
import {LoadSpinnerComponent} from "../load-spinner/load-spinner.component";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'app-user',
    imports: [
        FormsModule,
        NgIf,
        RouterLink,
        NgForOf,
        LoadSpinnerComponent,
        NgbAlert,
        DatePipe
    ],
    templateUrl: './user.component.html',
    standalone: true,
    styleUrl: './user.component.scss',
    providers: [UserService, SubscriptionService]
})
export class UserComponent implements OnInit {
    protected showSpinner: boolean;
    protected updateSuccessMessage: string | null;
    protected errorMessage: string | null;
    private readonly userId: number;
    protected user: UserDetail;
    protected subscriptions: string[] = [];

    constructor(
        private readonly userService: UserService,
        private readonly subscriptionService: SubscriptionService,
        private readonly activatedRoute: ActivatedRoute
    ) {
        const userId = activatedRoute.snapshot.params['userId'];
        if (!Number.isNaN(userId)) {
            this.userId = parseInt(userId);
        }
    }

    ngOnInit(): void {
        this.showSpinner = true;

        forkJoin([
            this.subscriptionService.getSubscriptions()
                .pipe(tap((subscriptions: SubscriptionType[]) => this.subscriptions = subscriptions.map((subscription: SubscriptionType) => subscription.name))),
            this.userService.getUser(this.userId)
                .pipe(tap((user: UserDetail) => this.user = user))
        ])
            .pipe(finalize(() => this.showSpinner = false))
            .subscribe({
                error: err => this.errorMessage = getErrorResponseMessage(err)
            });
    }

    updateUser(): void {
        this.userService.updateUser(this.userId, this.user)
            .subscribe({
                next: () => {
                    this.updateSuccessMessage = 'User updated successfully';
                    this.errorMessage = null;
                },
                error: err => {
                    this.errorMessage = getErrorResponseMessage(err);
                    this.updateSuccessMessage = null;
                }
            });
    }
}
