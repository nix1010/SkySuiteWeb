// alert-modal.service.ts
import { Injectable, ApplicationRef, EnvironmentInjector, createComponent } from '@angular/core';
import { AlertComponent } from '../components/alert/alert.component';

declare const bootstrap: any;

@Injectable({ providedIn: 'root' })
export class AlertModalService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  showAlert(config: {
    title?: string;
    content?: string;
    okContent?: string;
    closeContent?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      const componentRef = createComponent(AlertComponent, {
        environmentInjector: this.injector
      });

      const alert = componentRef.instance;
      alert.title = config.title ?? 'Pending Changes';
      alert.content = config.content ?? 'there are pending changes would like to save them?';
      alert.okContent = config.okContent ?? 'Save Changes';
      alert.closeContent = config.closeContent ?? 'Discard';

      this.appRef.attachView(componentRef.hostView);
      const element = (componentRef.hostView as any).rootNodes[0];
      document.body.appendChild(element);

      const dialogElement = element.querySelector('#alert');
      const dialog = new bootstrap.Modal(dialogElement);
      dialog.show();

      dialogElement.addEventListener('hidden.bs.modal', () => {
        resolve(alert.alertResult);
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      });
    });
  }
}
