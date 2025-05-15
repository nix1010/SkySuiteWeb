import {Component, OnDestroy, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";
import {NgbAlert, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {NgForOf, NgIf,CommonModule } from "@angular/common";
import {Pagination} from "../../models/page.model";
import { FormsModule } from '@angular/forms';
import {getErrorResponseMessage, unsubscribeFrom} from "../../utils/utils";
import {firstValueFrom, forkJoin, Observable, of, Subscription} from "rxjs";
import {UserService} from "../../services/user.service";
import { UserDetail } from '../../models/user-detail.model';
import {PagedResponse} from "../../models/paged-response.model";
import {LoadSpinnerComponent} from "../load-spinner/load-spinner.component";
import {catchError, finalize, tap} from "rxjs/operators";
import { SubscriptionsCount } from '../../models/subscription-status.model';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionType } from '../../models/subscription-type.model';
import { FeatureUsage } from '../../models/feature-usage.model';
import { AppEnvironmentService } from '../../services/apiEnvironment.service';
import { AlertModalService } from '../../services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-users',
    imports: [
        RouterLink,
        NgbPagination,
        NgIf,
        NgForOf,
        LoadSpinnerComponent,
        NgbAlert,
        FormsModule,
        CommonModule  
    ],
    templateUrl: './users.component.html',
    standalone: true,
    styleUrl: './users.component.scss',
    providers: [UserService,SubscriptionService]
})
export class UsersComponent implements OnInit, OnDestroy {
    private routerEventsSubscription: Subscription;
    private envSubscription : Subscription;
    public pagination: Pagination = new Pagination(1, 20, 0);
    public featurePagination: Pagination = new Pagination(1,200,0);
    protected errorMessage: string | null;
    protected showSpinner: boolean;
    protected users: UserDetail[] = [];
    protected isEditing:boolean = false;
    protected subsUsersCount : SubscriptionsCount[] = [];
    protected modifiedUsers:number[] =[];
    protected featureUsage : FeatureUsage[] = [];
    protected loadingMessage:string = "Loading please wait...";
    subscriptionTypes: { [key: number]: SubscriptionType } = {};
    subsKeys: number[] = [];
    private readonly featurePageSizeParam : string = 'featurePageSize';
    private readonly featurePageParam = 'featurePage';
    private readonly usersPageSizeParam = 'usersPageSize';
    private readonly usersPageParam = 'usersPage';
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly userService: UserService,
        private readonly subsService : SubscriptionService,
        private readonly appEnvService: AppEnvironmentService,
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
        this.envSubscription = this.appEnvService.getAppEnvNotifier().subscribe(async () => await this.reload());
    }
    ngOnDestroy(): void {
        unsubscribeFrom(this.routerEventsSubscription);
        unsubscribeFrom(this.envSubscription);
    }
    private async fetchAllData(): Promise<void>{
        try {
            await Promise.allSettled([
                this.fetchUsers(),
                this.fetchFeatureUsage(),
                this.fetchSubscribtions(),
                this.fetchSubscribtionsCount()
            ]);
        } catch (error) {
            this.showSpinner = false;
            this.errorMessage = 'An error occured while trying to load the data'
        }
    }
    private async fetchSubscribtions() : Promise<void>{
        try {
            const subscriptions = await firstValueFrom(this.subsService.getSubscriptions());
            this.subscriptionTypes = subscriptions.reduce((subs, sub, i) => {
                subs[i] = {
                ...sub,
                id: i,
                badge: this.getSubBadge(sub.name)
              };
              return subs;
            }, {} as { [key: number]: SubscriptionType });
            this.subsKeys = Object.keys(this.subscriptionTypes).map(key => +key);
        } catch (err) {
            this.errorMessage = getErrorResponseMessage(err as HttpErrorResponse);
        }
    }
    private async fetchUsers(): Promise<void> {
        try {
            const currentPage = this.getQueryParam(this.usersPageParam,this.pagination.currentPage);
            const pageSize = this.getQueryParam(this.usersPageSizeParam,this.pagination.pageSize);
            const pagedUsers = await firstValueFrom(this.userService.getUsersDetails(currentPage ?? this.pagination.currentPage,pageSize ?? this.pagination.pageSize));
            this.setPagination<UserDetail>(this.pagination, pagedUsers);
            this.users = pagedUsers.data;
        } catch (err) {
            this.errorMessage = getErrorResponseMessage(err as HttpErrorResponse);
        }
    }
    private async fetchSubscribtionsCount() : Promise<void> {
        try{
              const subsCounts =  await firstValueFrom(this.subsService.getSubscribtionsCount());
              this.subsUsersCount = subsCounts;
        }catch(err){
            this.errorMessage = getErrorResponseMessage(err as HttpErrorResponse);
        }
    }
    private async fetchFeatureUsage() : Promise<void> {
        try {
            const currentPage = this.getQueryParam(this.featurePageParam,this.featurePagination.currentPage);
            const pageSize = this.getQueryParam(this.featurePageSizeParam,this.featurePagination.pageSize);
            const pagedFeatures = await firstValueFrom(this.userService.getFeaturesUsage(currentPage ?? this.featurePagination.currentPage,pageSize ?? this.featurePagination.pageSize));
            this.setPagination<FeatureUsage>(this.featurePagination,pagedFeatures);
            this.featureUsage = pagedFeatures.data;
        } catch (err) {
            this.errorMessage = getErrorResponseMessage(err as HttpErrorResponse);
        }
    }
    private async reload(): Promise<void> {
        this.errorMessage = null;
        this.users = [];
        this.subsUsersCount = [];
        this.featureUsage = [];
        this.subscriptionTypes = {};
        this.subsKeys = [];
        this.modifiedUsers = [];
        this.loadingMessage = "Loading data please wait...";
        this.showSpinner = true;
        await this.fetchAllData();
        this.showSpinner = false;
    }
    private getSubBadge(name : string) : string {
        var badge = 'badge text-bg-info';
        switch(name){
                    case 'PAID':
                    badge= 'badge text-bg-primary';
                    break;
                    case 'ENTERPRISE':
                    badge= 'badge text-bg-success';
                    break;
                    case 'TRAIL':
                    badge= 'badge text-bg-warning';
                    break;
                    case 'INTERNAL':
                    badge= 'badge text-bg-secondary';
                    break;
        }
        return badge;
    }
    private setPagination<T>(pagination : Pagination,pagedResponse: PagedResponse<T>) {
        pagination.pageSize = pagedResponse.pageSize;
        pagination.currentPage = pagedResponse.pageNumber;
        pagination.totalCount = pagedResponse.totalCount;
    }

    setPageFromQueryParams(): void {
        let usersPage: number = this.getQueryParam(this.usersPageParam,this.pagination.currentPage);
        this.pagination.currentPage = usersPage;
        let featurePage: number = this.getQueryParam(this.featurePageParam,this.featurePagination.currentPage);
        this.featurePagination.currentPage = featurePage;
        let usersPageSize : number = this.getQueryParam(this.usersPageSizeParam,this.pagination.pageSize);
        this.pagination.pageSize = usersPageSize;
        let featurePageSize : number = this.getQueryParam(this.featurePageSizeParam,this.featurePagination.pageSize);
        this.featurePagination.pageSize = featurePageSize;
    }

    paginationExists(pagination : Pagination ): boolean {
        return !!pagination && !!pagination.currentPage && !!pagination.pageSize && !!pagination.totalCount;
    }
    onEditChange(event: any): void {
        this.isEditing = event.target.checked;
    }
    setQueryParams(param : string,value : number) : Promise<boolean>{
       return this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { [param]: value },
            queryParamsHandling: 'merge',
          });
    }
     pageChange(newPage : number): void{
        if(this.modifiedUsers.length > 0){
            this.alertService.showAlert({}).then((confirmed) => {
                if(confirmed){
                     this.saveUsers().then(() =>
                            this.setQueryParams(this.usersPageParam,newPage).then(async () => {
                            this.showSpinner = true;
                            await this.fetchUsers();
                            this.showSpinner = false;
                       }));

                }else {
                    this.cleanupAfterSave();
                }
            });
        }else {
            this.setQueryParams(this.usersPageParam,newPage).then(async () => {
                    this.showSpinner = true;
                    await this.fetchUsers();
                    this.showSpinner = false;
               });
        }
    }
    featurePageChange(newPage : number) : void {
        this.setQueryParams(this.featurePageParam,newPage).then(async () => {
                this.showSpinner = true;
                await this.fetchFeatureUsage();
                this.showSpinner = false;
           });
    }
    getSubscriptionStatus(expirationDate: string): { status: string; class: string } {
        if (!expirationDate) 
            return { status: 'Unknown', class: 'badge text-bg-secondary' };
        const date = Date.parse(expirationDate);
        return date < Date.now()
          ? { status: 'Expired', class: 'badge text-bg-danger' }
          : { status: 'Active', class: 'badge text-bg-success' };
      }

     changedUsers(userid : number) :void{
         if(!this.modifiedUsers.includes(userid)){
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
                  this.errorMessage ="An error occurred while trying to update please try again. Please try again later.";
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
            }
        else {
           this.cleanupAfterSave();
          this.showSpinner = false;
        }});
    }
    cleanupAfterSave() {
        this.isEditing = false;
        this.modifiedUsers = [];
    }

     onPageSizeChanged(event:any) : void{
        this.pagination.pageSize = event.target.value;
        this.setQueryParams(this.usersPageSizeParam,this.pagination.pageSize).then(async () => {
            this.showSpinner = true;
            await this.fetchUsers();
            this.showSpinner = false;
        });
     }
     onFeaturePageSizeChanged(event: any){
        this.featurePagination.pageSize = event.target.value;
        this.setQueryParams(this.featurePageSizeParam,this.featurePagination.pageSize).then(async () => {
            this.showSpinner = true;
            await this.fetchFeatureUsage();
            this.showSpinner = false;
        });
     }
     getQueryParam(param: string,defaultValue: number) : number {
        const params = this.activatedRoute.snapshot.queryParamMap;
        const pageParam = params.get(param);
        return pageParam ? parseInt(pageParam, 10) : defaultValue;
    }
}


