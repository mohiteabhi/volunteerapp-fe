import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-city-events',
  templateUrl: './city-events.component.html',
  styleUrls: ['./city-events.component.scss'],
})
export class CityEventsComponent {
  cityName: string = '';
  events: Event[] = [];
  loading: boolean = false;
  error: string = '';
  noEventsFound: boolean = false;
  joinedDates: Set<string> = new Set<string>();

  private userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {

    this.userId = this.auth.getUserId();

    this.route.queryParams.subscribe((params) => {
      this.cityName = params['search'];
      console.log('Query param cityName:', this.cityName);
      if (this.cityName) {
        this.loadEventsByCity();
      }
    });
  }

  loadEventsByCity(): void {
    this.loading = true;
    this.error = '';
    this.noEventsFound = false;

    this.eventService.getEventsByCity(this.cityName).subscribe({
      next: (events) => {
        // 3️⃣ filter out events created by the current user
        if (this.userId != null) {
          this.events = events.filter(
            (e) => e.user.userId !== this.userId
          );
        } else {
          this.events = events;
        }

        this.loading = false;
        this.noEventsFound = this.events.length === 0;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  joinEvent(event: Event): void {
    // Implement join event functionality
    console.log('Joining event:', event);
    if (this.isEventFull(event) || this.joinedDates.has(event.eventDate)) {
      return; // Should never happen because button is disabled when full
    }
    this.joinedDates.add(event.eventDate);

    this.eventService.joinEvent(event.id).subscribe({
      next: (updatedEvent) => {
        console.log('Event after join:', updatedEvent);

        // Option A) Re‐load entire list of events for this city:
        // this.loadEventsByCity();

        // Option B) Replace only the updated event in the array:
        const idx = this.events.findIndex((e) => e.id === updatedEvent.id);
        if (idx > -1) {
          this.events[idx] = updatedEvent;
        }
      },
      error: (errMsg) => {
        console.error('Error joining event:', errMsg);
        // Optionally show a toast or set this.error = errMsg to display an error message
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(datetimeString: string): string {
    if (!datetimeString || typeof datetimeString !== 'string') {
      return 'N/A'; // or return ''; or handle however you prefer
    }

    return datetimeString.substring(11, 16); // assuming you're extracting HH:mm from an ISO datetime
  }
  getVolunteerStatus(event: Event): string {
    const remaining = event.totalVol - event.noOfVolJoined;
    if (remaining <= 0) {
      return 'Full';
    }
    return `${remaining} spots left`;
  }

  isEventFull(event: Event): boolean {
    return event.noOfVolJoined >= event.totalVol;
  }

  hasJoinedSameDay(event: Event): boolean {
    return this.joinedDates.has(event.eventDate);
  }
}