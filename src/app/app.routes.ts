import {Routes} from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {ErrorPageComponent} from "./components/error-page/error-page.component";
import {AuthGuardService} from "./services/auth-guard.service";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {ComponentRoutes} from "./config/routes";
import {UsersComponent} from "./components/users/users.component";
import {Role} from "./models/authentication/role.model";
import {UserComponent} from "./components/user/user.component";
import {MainLayoutComponent} from "./components/main-layout/main-layout.component";

export const routes: Routes = [
    {
        path: '',
        redirectTo: ComponentRoutes.DASHBOARD,
        pathMatch: 'full'
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: ComponentRoutes.DASHBOARD,
                component: DashboardComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: ComponentRoutes.USERS,
                component: UsersComponent,
                canActivate: [AuthGuardService],
                data: {
                    roles: [Role.ADMIN]
                }
            },
            {
                path: `${ComponentRoutes.USERS}/:userId`,
                component: UserComponent,
                canActivate: [AuthGuardService],
                data: {
                    roles: [Role.ADMIN]
                }
            }
        ]
    },
    {
        path: ComponentRoutes.LOGIN,
        component: LoginComponent
    },
    {
        path: '**',
        component: ErrorPageComponent
    }
];
