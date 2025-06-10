import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NgbAlert, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {Pagination} from "../../models/page.model";
import {FormsModule} from '@angular/forms';
import {getErrorResponseMessage, unsubscribeFrom} from "../../utils/utils";
import {firstValueFrom, forkJoin, of, Subscription} from "rxjs";
import {UserService} from "../../services/user.service";
import {UserDetail} from '../../models/user-detail.model';
import {PagedResponse} from "../../models/paged-response.model";
import {LoadSpinnerComponent} from "../load-spinner/load-spinner.component";
import {catchError} from "rxjs/operators";
import {SubscriptionService} from '../../services/subscription.service';
import {AlertModalService} from '../../services/alert.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ASC_DIRECTION, CREATIONDATE_COL, DESC_DIRECTION} from '../../config/constants';
import {SubscriptionType} from '../../models/subscription-type.model';
import {TransformPipe} from "../../pipes/transform-pipe.pipe";

@Component({
    selector: 'app-users',
    imports: [
        NgbPagination,
        NgIf,
        NgForOf,
        LoadSpinnerComponent,
        NgbAlert,
        FormsModule,
        CommonModule,
        TransformPipe
    ],
    templateUrl: './users.component.html',
    standalone: true,
    styleUrl: './users.component.scss',
    providers: [UserService, SubscriptionService]
})
export class UsersComponent implements OnInit, OnDestroy {
    private routerEventsSubscription: Subscription;
    public pagination: Pagination = new Pagination(1, 2000000, 0);
    protected errorMessage: string | null;
    protected showSpinner: boolean;
    protected users: UserDetail[] = [];
    protected isEditing: boolean = false;
    protected modifiedUsers: number[] = [];
    protected loadingMessage: string = "Loading please wait...";
    public subscriptions: SubscriptionType[] = [];
    protected sortDirection: string = DESC_DIRECTION;
    protected sortColumn: string = CREATIONDATE_COL;
    private readonly usersPageSizeParam = 'usersPageSize';
    private readonly usersPageParam = 'usersPage';
    private readonly colsNameParam = 'col';
    private readonly sortDirectionParams = 'direction';

    constructor(
        private readonly userService: UserService,
        private readonly subsService: SubscriptionService,
        private readonly alertService: AlertModalService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute
    ) {
        this.setPageFromQueryParams();
    }

    ngOnInit(): void {
        this.loadingMessage = "Loading data please wait....";
        this.showSpinner = true;
        this.fetchAllData().then(() => this.showSpinner = false);
    }

    ngOnDestroy(): void {
        unsubscribeFrom(this.routerEventsSubscription);
    }

    private async fetchAllData(): Promise<void> {
        try {
            await Promise.allSettled([
                this.fetchUsers(),
                this.fetchSubscribtions()
            ]);
        } catch (error) {
            this.showSpinner = false;
            this.errorMessage = 'An error occured while trying to load the data'
        }
    }

    public sortData(column: string) {
        try {
            this.loadingMessage = "Loading data please wait....";
            this.showSpinner = true;
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === ASC_DIRECTION ? DESC_DIRECTION : ASC_DIRECTION;
            } else {
                this.sortColumn = column;
                this.sortDirection = DESC_DIRECTION;
            }
            this.setQueryParams(this.colsNameParam, column).then(() => this.setQueryParams(this.sortDirectionParams, this.sortDirection));
            this.fetchUsers().then(() => this.showSpinner = false);
        } catch (error) {
            this.showSpinner = false;
            this.errorMessage = 'An error occured while trying to load the data'
        }
    }

    private async fetchSubscribtions(): Promise<void> {
        try {
            this.subscriptions = await firstValueFrom(this.subsService.getSubscriptions());
        } catch (err) {
            this.errorMessage = getErrorResponseMessage(err as HttpErrorResponse);
        }
    }

    private async fetchUsers(): Promise<void> {
        try {
            const currentPage = this.getQueryParam(this.usersPageParam, this.pagination.currentPage);
            const pageSize = this.getQueryParam(this.usersPageSizeParam, this.pagination.pageSize);
            const pagedUsers = await firstValueFrom(
                this.userService.getUsersDetails(currentPage ?? this.pagination.currentPage, pageSize ?? this.pagination.pageSize, this.sortDirection ?? DESC_DIRECTION, this.sortColumn ?? CREATIONDATE_COL));
            this.setPagination<UserDetail>(this.pagination, pagedUsers);
            pagedUsers.data.forEach(u => {
                const date = new Date(u.subscriptionExpirationDate);
                if (!isNaN(date.getTime())) {
                    u.subscriptionExpirationDate = date.toISOString().split('T')[0];
                } else {
                    u.subscriptionExpirationDate = '';
                }
            });
            this.users = pagedUsers.data;
        } catch (err) {
            this.errorMessage = getErrorResponseMessage(err as HttpErrorResponse);
        }
    }

    getSubscriptionBadgeForId = (subscriptionId: number): string => {
        return this.getSubBadge(this.getSubscriptionNameForId(subscriptionId));
    }

    getSubscriptionNameForId = (subscriptionId: number): string => {
        return this.getSubscriptionById(subscriptionId)?.name ?? 'Unknown';
    }

    getSubBadge(name: string): string {
        switch (name) {
            case 'PRO':
                return 'badge text-bg-primary';
            case 'ENTERPRISE':
                return 'badge text-bg-success';
            case 'TRIAL':
                return 'badge text-bg-warning';
            case 'INTERNAL':
                return 'badge text-bg-secondary';
            default:
                return 'badge text-bg-info';
        }
    }

    getSubscriptionById = (subscriptionId: number): SubscriptionType | undefined => {
        return this.subscriptions.find((subscription: SubscriptionType) => subscription.id == subscriptionId);
    }

    private setPagination<T>(pagination: Pagination, pagedResponse: PagedResponse<T>) {
        pagination.pageSize = pagedResponse.pageSize;
        pagination.currentPage = pagedResponse.pageNumber;
        pagination.totalCount = pagedResponse.totalCount;
    }

    setPageFromQueryParams(): void {
        let usersPage: number = this.parseNumber(this.getQueryParam(this.usersPageParam, this.pagination.currentPage));
        this.pagination.currentPage = usersPage;
        let usersPageSize: number = this.parseNumber(this.getQueryParam(this.usersPageSizeParam, this.pagination.pageSize));
        this.pagination.pageSize = usersPageSize;
        this.sortColumn = this.getQueryParam(this.colsNameParam, CREATIONDATE_COL);
        this.sortDirection = this.getQueryParam(this.sortDirectionParams, DESC_DIRECTION);
    }

    paginationExists(pagination: Pagination): boolean {
        return !!pagination && !!pagination.currentPage && !!pagination.pageSize && !!pagination.totalCount;
    }

    onEditChange(event: any): void {
        this.isEditing = event.target.checked;
    }

    setQueryParams(param: string, value: any): Promise<boolean> {
        return this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: {[param]: value},
            queryParamsHandling: 'merge',
        });
    }

    pageChange(newPage: number): void {
        if (this.modifiedUsers.length > 0) {
            this.alertService.showAlert({}).then((confirmed) => {
                if (confirmed) {
                    this.saveUsers().then(() =>
                        this.setQueryParams(this.usersPageParam, newPage).then(async () => {
                            this.showSpinner = true;
                            await this.fetchUsers();
                            this.showSpinner = false;
                        }));

                } else {
                    this.cleanupAfterSave();
                }
            });
        } else {
            this.setQueryParams(this.usersPageParam, newPage).then(async () => {
                this.showSpinner = true;
                await this.fetchUsers();
                this.showSpinner = false;
            });
        }
    }

    getSubscriptionStatus(expirationDate: string): {status: string; class: string} {
        if (!expirationDate)
            return {status: 'Unknown', class: 'badge text-bg-secondary'};
        const date = Date.parse(expirationDate);
        return date < Date.now()
            ? {status: 'Expired', class: 'badge text-bg-danger'}
            : {status: 'Active', class: 'badge text-bg-success'};
    }

    changedUsers(userid: number): void {
        if (!this.modifiedUsers.includes(userid)) {
            this.modifiedUsers.push(userid);
        }
    }

    saveUsers(): Promise<void> {
        return new Promise(() => {
            this.showSpinner = true;
            this.loadingMessage = "Saving changes please wait...";
            const updateRequests = this.modifiedUsers
                .map(userId => {
                    const user = this.users.find(u => u.id === userId);
                    if (!user) return null;
                    return this.userService.updateUser(userId, user)
                        .pipe(catchError(error => {
                            console.error(`Failed to update user ${userId}:`, error);
                            return of(undefined);
                        }));
                }).filter(req => req !== null);
            if (updateRequests.length > 0) {
                forkJoin(updateRequests).pipe(
                    catchError(err => {
                        console.error("failed to forkJoin", err);
                        this.errorMessage = "An error occurred while trying to update please try again. Please try again later.";
                        this.showSpinner = false;
                        return of([]);
                    })
                ).subscribe({
                    next: () => {
                        this.cleanupAfterSave();
                    },
                    complete: () => {
                        this.showSpinner = false;
                    }
                });
            } else {
                this.cleanupAfterSave();
                this.showSpinner = false;
            }
        });
    }

    cleanupAfterSave() {
        this.isEditing = false;
        this.modifiedUsers = [];
    }

    onPageSizeChanged(event: any): void {
        this.pagination.pageSize = event.target.value;
        this.setQueryParams(this.usersPageSizeParam, this.pagination.pageSize).then(async () => {
            this.showSpinner = true;
            await this.fetchUsers();
            this.showSpinner = false;
        });
    }

    getQueryParam(param: string, defaultValue: any): any {
        const params = this.activatedRoute.snapshot.queryParamMap;
        return params.get(param) ?? defaultValue;
    }

    parseNumber(value: any, defaultValue: number = 10): number {
        return value ? parseInt(value, 10) : defaultValue;
    }
}


