import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/components/volunteering/services/auth.service';
import { EventService } from 'src/app/components/volunteering/services/event.service';
// import { Event } from '@angular/router';
import { Event } from 'src/app/components/volunteering/models/event.model';

interface ExtendedEvent extends Event {
  isEditing?: boolean;
  originalData?: Partial<Event>;
  skillsString?: string;
  errors?: { [key: string]: string };
}

@Component({
  selector: 'app-events-organized',
  templateUrl: './events-organized.component.html',
  styleUrls: ['./events-organized.component.scss'],
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
        this.events = evts.map((evt) => ({
          ...evt,
          isEditing: false,
          skillsString: evt.requiredSkills?.join(', ') || '',
          errors: {},
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error =
          typeof err === 'string' ? err : 'Failed to load organized events.';
        this.loading = false;
      },
    });
  }

  validateEvent(evt: ExtendedEvent): boolean {
    evt.errors = {};

    // 1. City Name Validation
    if (!evt.cityName) {
      evt.errors['cityName'] = 'City name is required';
    } else if (evt.cityName.trim().length < 2) {
      evt.errors['cityName'] = 'City name must be at least 2 characters';
    }

    // 2. Event Description Validation
    if (!evt.eventDes) {
      evt.errors['eventDes'] = 'Event description is required';
    } else if (evt.eventDes.trim().length < 10) {
      evt.errors['eventDes'] = 'Event description must be at least 10 characters';
    }

    // 3. Total Volunteers Validation
    if (evt.totalVol === null || evt.totalVol === undefined || String(evt.totalVol) === '') {
      evt.errors['totalVol'] = 'Total volunteers is required';
    } else {
      const volNum = Number(evt.totalVol);
      if (volNum < 1) {
        evt.errors['totalVol'] = 'Total volunteers must be at least 1';
      } else if (volNum > 1000) {
        evt.errors['totalVol'] = 'Total volunteers cannot exceed 1000';
      }
    }

    // 4. Event Date Validation
    if (!evt.eventDate) {
      evt.errors['eventDate'] = 'Event date is required';
    } else {
      const selectedDate = new Date(evt.eventDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        evt.errors['eventDate'] = 'Event date cannot be in the past';
      }
    }

    // 5. Event Time Validation
    if (!evt.eventTime) {
      evt.errors['eventTime'] = 'Event time is required';
    }

    // 6. Address Validation
    if (!evt.address) {
      evt.errors['address'] = 'Address is required';
    } else if (evt.address.trim().length < 10) {
      evt.errors['address'] = 'Address must be at least 10 characters';
    }

    // 7. Contact Validation
    const contactStr = String(evt.contact || '').trim();
    if (!contactStr) {
      evt.errors['contact'] = 'Contact number is required';
    } else if (!/^[0-9]{10}$/.test(contactStr)) {
      evt.errors['contact'] = 'Please enter a valid 10-digit phone number';
    }

    // 8. Required Skills Validation
    const skillsList = evt.skillsString
      ?.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0) || [];
    if (skillsList.length === 0) {
      evt.errors['skillsString'] = 'At least one required skill is required';
    }

    return Object.keys(evt.errors).length === 0;
  }

  toggleEdit(evt: ExtendedEvent): void {
    if (evt.isEditing) {
      // Cancel edit mode
      this.cancelEdit(evt);
    } else {
      // Enter edit mode - first cancel any other editing events
      this.events.forEach((e) => {
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
        contact: evt.contact,
      };
      evt.isEditing = true;
      evt.skillsString = evt.requiredSkills?.join(', ') || '';
      evt.errors = {};
    }
  }

  cancelEdit(evt: ExtendedEvent): void {
    if (evt.originalData) {
      // Restore original data
      Object.assign(evt, evt.originalData);
      evt.originalData = undefined;
      evt.skillsString = evt.requiredSkills?.join(', ') || '';
    }
    evt.isEditing = false;
    evt.errors = {};
  }

  saveEvent(evt: ExtendedEvent): void {
    if (!this.validateEvent(evt)) {
      return;
    }

    evt.requiredSkills =
      evt.skillsString
        ?.split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0) || [];

    const payload: Partial<Event> = {
      cityName: evt.cityName,
      eventDes: evt.eventDes,
      totalVol: evt.totalVol,
      noOfVolJoined: evt.noOfVolJoined,
      eventDate: evt.eventDate,
      eventTime: evt.eventTime,
      address: evt.address,
      organizerName: evt.organizerName,
      contact: evt.contact,
      requiredSkills: evt.requiredSkills,
    };

    this.eventService.updateEvent(evt.id, payload).subscribe({
      next: (updated) => {
        Object.assign(evt, updated);
        evt.skillsString = evt.requiredSkills.join(', ');
        evt.isEditing = false;
        evt.originalData = undefined;
        evt.errors = {};

        // Show success message (you can implement toast notification here)
        console.log('Event updated successfully');
      },
      error: (err) => {
        console.error('Update failed', err);
        // You can implement a toast notification or modal here
        alert('Failed to save changes. Please try again.');
      },
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
      },
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
        day: 'numeric',
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
  }

  getSkillsArray(skills: string | string[]): string[] {
    if (Array.isArray(skills)) {
      return skills;
    }
    if (typeof skills === 'string') {
      return skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return [];
  }
}
