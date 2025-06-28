import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/components/volunteering/services/auth.service';
import { EventService } from 'src/app/components/volunteering/services/event.service';
// import { Event } from '@angular/router';
import { Event } from 'src/app/components/volunteering/models/event.model';

interface ExtendedEvent extends Event {
  isEditing?: boolean;
  originalData?: Partial<Event>;
}

@Component({
  selector: 'app-events-organized',
  templateUrl: './events-organized.component.html',
  styleUrls: ['./events-organized.component.scss']
})
export class EventsOrganizedComponent {
  events: ExtendedEvent[] = [];
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
    this.error = '';
    
    this.eventService.getEventsByUser(this.userId!).subscribe({
      next: (evts) => {
        this.events = evts.map(evt => ({
          ...evt,
          isEditing: false
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Failed to load organized events.';
        this.loading = false;
      }
    });
  }

  toggleEdit(evt: ExtendedEvent): void {
    if (evt.isEditing) {
      // Cancel edit mode
      this.cancelEdit(evt);
    } else {
      // Enter edit mode - first cancel any other editing events
      this.events.forEach(e => {
        if (e.isEditing && e.id !== evt.id) {
          this.cancelEdit(e);
        }
      });
      
      // Store original data for cancel functionality
      evt.originalData = {
        cityName: evt.cityName,
        eventDes: evt.eventDes,
        totalVol: evt.totalVol,
        eventDate: evt.eventDate,
        eventTime: evt.eventTime,
        address: evt.address,
        contact: evt.contact
      };
      evt.isEditing = true;
    }
  }

  cancelEdit(evt: ExtendedEvent): void {
    if (evt.originalData) {
      // Restore original data
      Object.assign(evt, evt.originalData);
      evt.originalData = undefined;
    }
    evt.isEditing = false;
  }

  saveEvent(evt: ExtendedEvent): void {
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
        evt.isEditing = false;
        evt.originalData = undefined;
        
        // Show success message (you can implement toast notification here)
        console.log('Event updated successfully');
      },
      error: (err) => {
        console.error('Update failed', err);
        // You can implement a toast notification or modal here
        alert('Failed to save changes. Please try again.');
      }
    });
  }

  deleteEvent(evt: ExtendedEvent): void {
    const eventTitle = evt.eventDes || `Event #${evt.id}`;
    const confirmMessage = `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;

    this.eventService.deleteEvent(evt.id).subscribe({
      next: () => {
        this.events = this.events.filter((e) => e.id !== evt.id);
        console.log('Event deleted successfully');
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Failed to delete event. Please try again.');
      }
    });
  }

  createNewEvent(): void {
    // Navigate to create event page
    this.router.navigate(['/organize-event']);
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDateTime(date: string, time: string): string {
    if (!date) return 'Date not set';
    
    try {
      const dateObj = new Date(date);
      const dateStr = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      if (time) {
        const timeStr = this.formatTime(time);
        return `${dateStr} at ${timeStr}`;
      }
      
      return dateStr;
    } catch (error) {
      return 'Invalid date';
    }
  }

  private formatTime(time: string): string {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return time;
    }
  }

  getProgressPercentage(joined: number, total: number): number {
    if (!total || total <= 0) return 0;
    const percentage = (joined / total) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  }}
