import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {getErrorResponseMessage, unsubscribeFrom} from "../../utils/utils";
import { catchError, firstValueFrom, forkJoin, of, Subscription } from 'rxjs';
import { Pagination } from '../../models/page.model';
import { UserDetail } from '../../models/user-detail.model';
import { SubscriptionsCount } from '../../models/subscription-status.model';
import { FeatureUsage } from '../../models/feature-usage.model';
import { SubscriptionType } from '../../models/subscription-type.model';
import { UserService } from '../../services/user.service';
import { SubscriptionService } from '../../services/subscription.service';
import { AlertModalService } from '../../services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PagedResponse } from '../../models/paged-response.model';
import { NgbAlert, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { LoadSpinnerComponent } from '../load-spinner/load-spinner.component';
import { FormsModule } from '@angular/forms';
import { UsersComponent } from '../users/users.component';

@Component({
    selector: 'app-dashboard',
    imports: [
        RouterLink,
        NgbPagination,
        NgIf,
        NgForOf,
        LoadSpinnerComponent,
        NgbAlert,
        FormsModule,
        CommonModule,
        UsersComponent
    ],
    templateUrl: './dashboard.component.html',
    standalone: true,
    styleUrl: './dashboard.component.scss',
    providers: [UserService,SubscriptionService]
})
export class DashboardComponent implements OnInit,OnDestroy {

      private routerEventsSubscription: Subscription;
      public featurePagination: Pagination = new Pagination(1,200,0);
      protected errorMessage: string | null;
      protected showSpinner: boolean;
      protected subsUsersCount : SubscriptionsCount[] = [];
      protected featureUsage : FeatureUsage[] = [];
      protected loadingMessage:string = "Loading please wait...";
      
      private readonly featurePageSizeParam : string = 'featurePageSize';
      private readonly featurePageParam = 'featurePage';
      constructor(
          private readonly userService: UserService,
          private readonly subsService : SubscriptionService,
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
      private async fetchAllData(): Promise<void>{
          try {
              await Promise.allSettled([
                  this.fetchFeatureUsage(),
                  this.fetchSubscribtionsCount()
              ]);
          } catch (error) {
              this.showSpinner = false;
              this.errorMessage = 'An error occured while trying to load the data'
          }
      }    
      private async fetchSubscribtionsCount() : Promise<void> {
          try{
                const subsCounts =  await firstValueFrom(this.subsService.getSubscribtionsCount());
                this.subsUsersCount = subsCounts;
                var sum = this.subsUsersCount.reduce((sum, subs) => sum + subs.userCount, 0);
                this.subsUsersCount.push({ 
                                            subscriptionName : "Total Subscriptions",
                                            userCount : sum
                });
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
      private setPagination<T>(pagination : Pagination,pagedResponse: PagedResponse<T>) {
          pagination.pageSize = pagedResponse.pageSize;
          pagination.currentPage = pagedResponse.pageNumber;
          pagination.totalCount = pagedResponse.totalCount;
      }
  
      setPageFromQueryParams(): void {
 
          let featurePage: number = this.getQueryParam(this.featurePageParam,this.featurePagination.currentPage);
          this.featurePagination.currentPage = featurePage;
          let featurePageSize : number = this.getQueryParam(this.featurePageSizeParam,this.featurePagination.pageSize);
          this.featurePagination.pageSize = featurePageSize;
      }
  
      paginationExists(pagination : Pagination ): boolean {
          return !!pagination && !!pagination.currentPage && !!pagination.pageSize && !!pagination.totalCount;
      }
      setQueryParams(param : string,value : number) : Promise<boolean>{
         return this.router.navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: { [param]: value },
              queryParamsHandling: 'merge',
            });
      }
      featurePageChange(newPage : number) : void {
          this.setQueryParams(this.featurePageParam,newPage).then(async () => {
                  this.showSpinner = true;
                  await this.fetchFeatureUsage();
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
