import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { RouterModule, Routes } from '@angular/router';
import { VolunteeringComponent } from './components/volunteering/volunteering.component';
import { LoginComponent } from './components/volunteering/auth/login/login.component';
import { SignupComponent } from './components/volunteering/auth/signup/signup.component';
import { DashboardComponent } from './components/volunteering/UserDashboard/dashboard/dashboard.component';
import { CityEventsComponent } from './components/volunteering/city-events/city-events.component';
import { OrganizeEventComponent } from './components/volunteering/organize-event/organize-event.component';

const routes: Routes = [
  { path: '', component: VolunteeringComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'city-events', component: CityEventsComponent, canActivate: [AuthGuard] },
  { path: 'organize-event', component: OrganizeEventComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
