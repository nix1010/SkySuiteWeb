import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Directive({
    standalone: true,
    selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {

    @Input('appHasRole')
    private roles: any;
    private visible: boolean = false;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly viewContainerRef: ViewContainerRef,
        private readonly templateRef: TemplateRef<any>
    ) { }

    ngOnInit() {
        if (Object.prototype.toString.call(this.roles) !== '[object Array]') {
            this.roles = [this.roles];
        }

        if (this.authenticationService.hasRoles(this.roles)) {
            if (!this.visible) {
                this.visible = true;
                this.viewContainerRef.createEmbeddedView(this.templateRef);
            }
        } else {
            this.visible = false;
            this.viewContainerRef.clear();
        }
    }
}
