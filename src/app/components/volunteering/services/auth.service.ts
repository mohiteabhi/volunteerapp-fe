import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SignupRequest, SignupResponse } from '../models/auth.model';
import { LoginRequest, JwtResponse } from '../models/auth.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient) {}

  signup(data: SignupRequest): Observable<SignupResponse> {
    const url = `${this.baseUrl}/signup`;
    return this.http
      .post<SignupResponse>(url, data, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(catchError(this.handleError));
  }

  login(data: LoginRequest): Observable<JwtResponse> {
    return this.http
      .post<JwtResponse>(`${this.baseUrl}/login`, data, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        tap((res) => {
          localStorage.setItem('auth_token', res.token);
          this._isLoggedIn.next(true);
        }),
        catchError(this.handleError)
      );
  }

  logout() {
    localStorage.removeItem('auth_token');
    this._isLoggedIn.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private handleError(err: HttpErrorResponse) {
    let msg = 'An unknown error occurred!';
    if (
      err.status === 400 &&
      typeof err.error === 'string' &&
      err.error.includes('already in use')
    ) {
      msg = 'Email is already registered';
    } else if (err.error instanceof ErrorEvent) {
      msg = `Network error: ${err.error.message}`;
    } else {
      msg = `Server error (${err.status}): ${err.message}`;
    }
    return throwError(() => msg);
  }
}
