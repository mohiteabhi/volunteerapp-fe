import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EventJoin } from 'src/app/components/volunteering/models/joined-event.model';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/components/volunteering/services/auth.service';

@Component({
  selector: 'app-event-joined',
  templateUrl: './event-joined.component.html',
  styleUrls: ['./event-joined.component.scss'],
})
export class EventJoinedComponent {
  joinedEvents: EventJoin[] = [];
  userId: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadJoinedEvents();
  }

  loadJoinedEvents(): void {
    this.http
      .get<EventJoin[]>(`${environment.apiBaseUrl}/joins/user/${this.userId}`)
      .subscribe({
        next: (data) => (this.joinedEvents = data),
        error: (err) => console.error('Failed to load joined events', err),
      });
  }

  returnToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  exitEvent(joinId: number): void {
    const confirmed = confirm('Are you sure you want to exit this event?');
    if (confirmed) {
      this.http.delete(`${environment.apiBaseUrl}/joins/${joinId}`).subscribe({
        next: () => {
          alert('Exited event successfully');
          this.loadJoinedEvents();
        },
        error: (err) => alert('Error exiting event: ' + err.message),
      });
    }
  }
}
