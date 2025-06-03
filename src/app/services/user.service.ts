import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {UserOverview} from "../models/user-overview.model";
import {UserDetail} from "../models/user-detail.model";
import {Observable} from "rxjs";
import {PagedResponse} from "../models/paged-response.model";
import { FeatureUsage } from "../models/feature-usage.model";

@Injectable()
export class UserService {
    private readonly baseUrl: string = 'users';

    constructor(
        private readonly httpClient: HttpClient
    ) {
    }

    public getUsers(pageNumber: number, pageSize: number): Observable<PagedResponse<UserOverview>> {
        return this.httpClient.get<PagedResponse<UserOverview>>(this.baseUrl, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize
            }
        });
    }
    public getUsersDetails(pageNumber: number, pageSize: number,direction: string = 'desc',column:string = ''): Observable<PagedResponse<UserDetail>> {
        return this.httpClient.get<PagedResponse<UserDetail>>(this.baseUrl, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sortCriteria  : column,
                sortDirection : direction
            }
        });
    }
    public getFeaturesUsage(pageNumber: number, pageSize: number): Observable<PagedResponse<FeatureUsage>> {
        return this.httpClient.get<PagedResponse<FeatureUsage>>(`${this.baseUrl}/feature-usage`, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize
            }
        });
    }
    public getUser(userId: number): Observable<UserDetail> {
        return this.httpClient.get<UserDetail>(`${this.baseUrl}/${userId}`);
    }
    public updateUser(userId: number, user: UserDetail): Observable<void> {
        return this.httpClient.post<void>(`${this.baseUrl}/${userId}`, user);
    }
}