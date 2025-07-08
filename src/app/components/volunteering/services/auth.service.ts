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
import { jwtDecode } from 'jwt-decode';

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
          // localStorage.setItem('user_id', String(res.userId));
          this._isLoggedIn.next(true);
        }),
        catchError(this.handleError)
      );
  }

  logout() {
    localStorage.removeItem('auth_token');
    // localStorage.removeItem('user_id');
    this._isLoggedIn.next(false);
  }

  forgotPassword(data: { email: string }): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/forgot-password`, data)
      .pipe(catchError(this.handleError));
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/reset-password`, data)
      .pipe(catchError(this.handleError));
  }

  getUserId(): number | null {
    // const userId = localStorage.getItem('user_id');
    // return userId ? parseInt(userId, 10) : null;
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId ? parseInt(decoded.userId, 10) : null;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
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
