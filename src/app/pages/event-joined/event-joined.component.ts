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
export class EventJoinedComponent implements OnInit {
  joinedEvents: EventJoin[] = [];
  loading = false;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadJoinedEvents();
  }

  loadJoinedEvents(): void {
    const userId = this.authService.getUserId();
    console.log('Loading events for user:', userId);
    
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.http
      .get<EventJoin[]>(`${environment.apiBaseUrl}/joins/user/${userId}`)
      .subscribe({
        next: (data) => {
          this.joinedEvents = data;
          this.loading = false;
          console.log('Loaded joined events:', data);
        },
        error: (err) => {
          console.error('Failed to load joined events', err);
          this.loading = false;
          this.showErrorMessage('Failed to load your joined events. Please try again.');
        },
      });
  }

  returnToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  exitEvent(joinId: number): void {
    // Find the event name for better user confirmation
    const eventToExit = this.joinedEvents.find(join => join.id === joinId);
    const eventName = eventToExit ? eventToExit.event.eventDes : 'this event';
    
    const confirmed = this.showConfirmDialog(
      `Are you sure you want to exit "${eventName}"?`,
      'This action cannot be undone. You will need to rejoin if you change your mind.'
    );
    
    if (confirmed) {
      this.loading = true;
      this.http.delete(`${environment.apiBaseUrl}/joins/${joinId}`).subscribe({
        next: () => {
          this.showSuccessMessage(`Successfully exited "${eventName}"`);
          this.loadJoinedEvents(); // Reload the list
        },
        error: (err) => {
          console.error('Error exiting event:', err);
          this.loading = false;
          this.showErrorMessage(`Failed to exit "${eventName}". Please try again.`);
        },
      });
    }
  }

  // Enhanced user feedback methods
  private showConfirmDialog(message: string, details?: string): boolean {
    const fullMessage = details 
      ? `${message}\n\n${details}` 
      : message;
    return confirm(fullMessage);
  }

  private showSuccessMessage(message: string): void {
    // You can replace this with a toast notification service if available
    alert(`✅ ${message}`);
  }

  private showErrorMessage(message: string): void {
    // You can replace this with a toast notification service if available
    alert(`❌ ${message}`);
  }

  // Utility method to format date for better display
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  // Utility method to format time for better display
  formatTime(timeString: string): string {
    try {
      // Assuming timeString is in HH:mm format
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  }
}