import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { prodEnvironment} from '../../environments/environment'
import { devEnvironment } from '../../environments/environment.development';

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
      ? prodEnvironment.apiUrl
      : devEnvironment.apiUrl;
  }

  getAppEnvNotifier(): Observable<void> {
    return this.applyEnvTrigger.asObservable();
  }
}