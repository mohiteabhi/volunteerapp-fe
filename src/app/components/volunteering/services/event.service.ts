import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Event, CreateEventRequest, CreateEventResponse } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getEventsByCity(cityName: string): Observable<Event[]> {
    const url = `${this.apiUrl}/events/city/${cityName}`;
    return this.http.get<Event[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

    createEvent(eventData: CreateEventRequest): Observable<CreateEventResponse> {
    const url = `${this.apiUrl}/events`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<CreateEventResponse>(url, eventData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

    joinEvent(eventId: number): Observable<Event> {
    const url = `${this.apiUrl}/events/${eventId}/join`;
    return this.http.put<Event>(url, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 404:
          errorMessage = 'No events found for this city';
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
    
    console.error('EventService Error:', errorMessage);
    return throwError(() => errorMessage);
  }
}