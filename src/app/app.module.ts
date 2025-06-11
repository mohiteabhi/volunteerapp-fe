import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VolunteeringComponent } from './components/volunteering/volunteering.component';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

import { LoginComponent } from './components/volunteering/auth/login/login.component';
import { SignupComponent } from './components/volunteering/auth/signup/signup.component';
import { DashboardComponent } from './components/volunteering/UserDashboard/dashboard/dashboard.component';
import { CityEventsComponent } from './components/volunteering/city-events/city-events.component';
import { EventService } from './components/volunteering/services/event.service';
import { OrganizeEventComponent } from './components/volunteering/organize-event/organize-event.component';
import { EventJoinedComponent } from './pages/event-joined/event-joined.component';




@NgModule({
  declarations: [
    AppComponent,
    VolunteeringComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    CityEventsComponent,
    OrganizeEventComponent,
    EventJoinedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,

    // PrimeNG Modules
    ButtonModule,
    RippleModule,
    MenubarModule,
    CardModule,
    InputTextModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    EventService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
