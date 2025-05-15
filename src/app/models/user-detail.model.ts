import {UserOverview} from "./user-overview.model";

export class UserDetail extends UserOverview {
    subscription: number;
    subscriptionExpirationDate: string;
    creationDate:string;
    mobilePhone: string;
    country: string;
    company: string;
    titles: string;
    industry: string;
    activationCount: number;
    dataTableSize: number;
    aiTokens: number;


}