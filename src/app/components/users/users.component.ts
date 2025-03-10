import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";
import {NgbAlert, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {NgForOf, NgIf} from "@angular/common";
import {Pagination} from "../../models/page.model";
import {getErrorResponseMessage, unsubscribeFrom} from "../../utils/utils";
import {Subscription} from "rxjs";
import {UserService} from "../../services/user.service";
import {UserOverview} from "../../models/user-overview.model";
import {PagedResponse} from "../../models/paged-response.model";
import {LoadSpinnerComponent} from "../load-spinner/load-spinner.component";
import {finalize} from "rxjs/operators";

@Component({
    selector: 'app-users',
    imports: [
        RouterLink,
        NgbPagination,
        NgIf,
        NgForOf,
        LoadSpinnerComponent,
        NgbAlert
    ],
    templateUrl: './users.component.html',
    standalone: true,
    styleUrl: './users.component.scss',
    providers: [UserService]
})
export class UsersComponent implements OnInit, OnDestroy {
    private routerEventsSubscription: Subscription;

    public pagination: Pagination = new Pagination(1, 10, 0);
    protected errorMessage: string | null;
    protected showSpinner: boolean;
    protected users: UserOverview[] = [];

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute
    ) {
        this.setPageFromQueryParams();
    }

    ngOnInit(): void {
        this.fetchUsers();
        this.routerEventsSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.fetchUsers();
            }
        });
    }

    ngOnDestroy(): void {
        unsubscribeFrom(this.routerEventsSubscription);
    }

    private fetchUsers(): void {
        this.showSpinner = true;
        this.userService.getUsers(this.pagination.currentPage, this.pagination.pageSize)
            .pipe(finalize(() => this.showSpinner = false))
            .subscribe({
                next: (pagedUsers: PagedResponse<UserOverview>) => {
                    this.setPagination(pagedUsers);
                    this.users = pagedUsers.data;
                },
                error: err => this.errorMessage = getErrorResponseMessage(err),
            })
    }

    private setPagination(pagedUsers: PagedResponse<UserOverview>) {
        this.pagination.pageSize = pagedUsers.pageSize;
        this.pagination.currentPage = pagedUsers.pageNumber;
        this.pagination.totalCount = pagedUsers.totalCount;
    }

    setPageFromQueryParams(): void {
        let pageQueryParam: string | null = this.activatedRoute.snapshot.queryParamMap.get('page');

        if (pageQueryParam) {
            let page: number = Number(pageQueryParam);

            if (!Number.isNaN(page)) {
                this.pagination.currentPage = page;
            }
        }
    }

    paginationExists(): boolean {
        return !!this.pagination && !!this.pagination.currentPage && !!this.pagination.pageSize && !!this.pagination.totalCount;
    }

    pageChange(): void {
        this.router.navigate([],
            {
                queryParams: {
                    page: this.pagination.currentPage
                }
            }).then();
    }
}
