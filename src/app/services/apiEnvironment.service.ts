import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppEnvironmentService {
  private isProd = new BehaviorSubject<boolean>(false);
  private applyEnvTrigger = new Subject<void>();
  public setAppEnvironment(prodEnv: boolean): void {
    this.isProd.next(prodEnv);
    this.applyEnvTrigger.next();
  }

  public getApiUrl(): string {
    return this.isProd.value
      ? 'https://skysuite-api-production.purpleground-18b21c29.eastus.azurecontainerapps.io'
      : 'https://skysuite-api-dev.wonderfulriver-db6cedb8.eastus.azurecontainerapps.io';
  }

  getAppEnvNotifier(): Observable<void> {
    return this.applyEnvTrigger.asObservable();
  }
}