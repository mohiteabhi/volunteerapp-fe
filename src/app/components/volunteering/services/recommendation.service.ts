import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface SuggestedEvent {
  eventId: number;
  userId: number;
  cityName: string;
  eventDes: string;
  totalVol: number;
  noOfVolJoined: number;
  eventDate: string;
  eventTime: string;
  address: string;
  organizerName: string;
  contact: string;
  requiredSkills: string[];
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getRecommendations(userId: number): Observable<SuggestedEvent[]> {
    const url = `${this.apiUrl}/recommendations/users/${userId}`;
    return this.http
      .get<SuggestedEvent[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 404:
          errorMessage = 'No recommendations found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        case 0:
          errorMessage = 'Unable to connect to server. Please check your connection';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('RecommendationService Error:', errorMessage);
    return throwError(() => errorMessage);
  }
}
