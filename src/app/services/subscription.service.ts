import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {SubscriptionType} from "../models/subscription-type.model";
import {Injectable} from "@angular/core";
import { SubscriptionsCount } from "../models/subscription-status.model";

@Injectable()
export class SubscriptionService {
    private readonly baseUrl: string = 'subscriptions';

    constructor(
        private readonly httpClient: HttpClient
    ) { }

    public getSubscriptions(): Observable<SubscriptionType[]> {
        return this.httpClient.get<SubscriptionType[]>(this.baseUrl);
    }

    public getSubscribtionsCount(): Observable<SubscriptionsCount[]> {
        return this.httpClient.get<SubscriptionsCount[]>(`${this.baseUrl}/user-counts`);
    }
}