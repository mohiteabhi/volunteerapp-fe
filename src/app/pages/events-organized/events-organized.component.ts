import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/components/volunteering/services/auth.service';
import { EventService } from 'src/app/components/volunteering/services/event.service';
// import { Event } from '@angular/router';
import { Event } from 'src/app/components/volunteering/models/event.model';

@Component({
  selector: 'app-events-organized',
  templateUrl: './events-organized.component.html',
  styleUrls: ['./events-organized.component.scss']
})
export class EventsOrganizedComponent {
  events: Event[] = [];
  loading = false;
  error = '';

  private userId: number | null = null;

    constructor(
    private auth: AuthService,
    private eventService: EventService,
    private router: Router
  ) {}

    ngOnInit(): void {
    this.userId = this.auth.getUserId();
    if (!this.userId) {
      this.error = 'Please log in to see your organized events.';
      return;
    }
    this.loadOrganizedEvents();
  }

  loadOrganizedEvents(): void {
        this.loading = true;
    this.eventService.getEventsByUser(this.userId!).subscribe({
      next: (evts) => {
        this.events = evts;
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      }
    });
  }
    saveEvent(evt: Event): void {
    const payload: Partial<Event> = {
      cityName: evt.cityName,
      eventDes: evt.eventDes,
      totalVol: evt.totalVol,
      noOfVolJoined: evt.noOfVolJoined,
      eventDate: evt.eventDate,
      eventTime: evt.eventTime,
      address: evt.address,
      organizerName: evt.organizerName,
      contact: evt.contact
    };
    this.eventService.updateEvent(evt.id, payload).subscribe({
      next: (updated) => {
        Object.assign(evt, updated);
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Failed to save changes.');
      }
    });
  }

    deleteEvent(evt: Event): void {
    if (!confirm(`Delete event on ${evt.eventDate}?`)) return;
    this.eventService.deleteEvent(evt.id).subscribe({
      next: () => {
        this.events = this.events.filter((e) => e.id !== evt.id);
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Failed to delete event.');
      }
    });
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }



}
