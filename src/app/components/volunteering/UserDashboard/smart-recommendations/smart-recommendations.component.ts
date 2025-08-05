import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  RecommendationService,
  SuggestedEvent,
} from '../../services/recommendation.service';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { EventJoin } from '../../models/joined-event.model';

@Component({
  selector: 'app-smart-recommendations',
  templateUrl: './smart-recommendations.component.html',
  styleUrls: ['./smart-recommendations.component.scss'],
})
export class SmartRecommendationsComponent {
  recommendations: SuggestedEvent[] = [];
  loading: boolean = false;
  error: string = '';
  analyzing: boolean = false;
  joinedEventIds = new Set<number>();
  private userId: number | null = null;

  constructor(
    private recommendationService: RecommendationService,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId !== null) {
      this.loadJoinedEvents();
    }
    this.loadSmartRecommendations();
  }

  private loadJoinedEvents(): void {
    this.eventService.getJoinedEventsByUser(this.userId!).subscribe({
      next: (joins: EventJoin[]) => {
        joins.forEach((j) => this.joinedEventIds.add(j.event.id));
      },
      error: (err) => console.error('Error loading joined events', err),
    });
  }

  loadSmartRecommendations(): void {
    if (!this.userId) return;

    this.analyzing = true;
    this.loading = true;
    this.error = '';

    // Show analyzing message for 2 seconds
    setTimeout(() => {
      this.analyzing = false;

      this.recommendationService.getRecommendations(this.userId!).subscribe({
        next: (recommendations) => {
          // Filter out user's own events and events already joined
          this.recommendations = recommendations.filter(
            (rec) =>
              rec.userId !== this.userId &&
              !this.joinedEventIds.has(rec.eventId)
          );
          this.loading = false;
        },
        error: (err) => {
          this.error = err;
          this.loading = false;
          this.analyzing = false;
        },
      });
    }, 2000);
  }

  joinEvent(event: SuggestedEvent): void {
    if (this.isEventFull(event) || this.hasJoined(event)) {
      return;
    }

    this.eventService.joinEvent(event.eventId).subscribe({
      next: (updatedEvent) => {
        console.log('Event after join:', updatedEvent);

        // Update the recommendation in the array
        const idx = this.recommendations.findIndex(
          (r) => r.eventId === updatedEvent.id
        );
        if (idx > -1) {
          this.recommendations[idx].noOfVolJoined = updatedEvent.noOfVolJoined;
          this.joinedEventIds.add(updatedEvent.id);
        }
      },
      error: (errMsg) => {
        console.error('Error joining event:', errMsg);
        this.error = errMsg;
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

  getVolunteerStatus(event: SuggestedEvent): string {
    const remaining = event.totalVol - event.noOfVolJoined;
    if (remaining <= 0) {
      return 'Full';
    }
    return `${remaining} spots left`;
  }

  isEventFull(event: SuggestedEvent): boolean {
    return event.noOfVolJoined >= event.totalVol;
  }

  hasJoined(event: SuggestedEvent): boolean {
    return this.joinedEventIds.has(event.eventId);
  }

  getScoreColor(score: number): string {
    if (score >= 2) return '#10b981'; // Green
    if (score >= 1.5) return '#f59e0b'; // Yellow
    return '#6b7280'; // Gray
  }

  getScoreText(score: number): string {
    if (score >= 2) return 'Perfect Match';
    if (score >= 1.5) return 'Good Match';
    return 'City Match';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
