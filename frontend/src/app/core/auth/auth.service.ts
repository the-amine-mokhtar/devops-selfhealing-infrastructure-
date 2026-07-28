import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ey_token';
  private readonly USER_KEY = 'ey_user';
  private readonly EXPIRY_KEY = 'ey_session_expiry';
  private readonly SESSION_DURATION_MS = 30 * 60 * 1000;
  private readonly apiUrl = '/api/auth';

  private sessionExpiredSubject = new BehaviorSubject<boolean>(false);
  sessionExpired$: Observable<boolean> = this.sessionExpiredSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (!expiry) return false;
    if (Date.now() > Number(expiry)) {
      this.logout(true);
      return false;
    }
    return !!this.token;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify({ email: res.email, fullName: res.fullName, role: res.role }));
        localStorage.setItem(this.EXPIRY_KEY, String(Date.now() + this.SESSION_DURATION_MS));
        this.sessionExpiredSubject.next(false);
      })
    );
  }

  logout(silent = false): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    if (!silent) {
      this.sessionExpiredSubject.next(false);
    }
  }

  getRole(): string | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw).role ?? null;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  getUser(): { email?: string; fullName?: string; role?: string } | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  markExpired(): void {
    this.sessionExpiredSubject.next(true);
  }
}