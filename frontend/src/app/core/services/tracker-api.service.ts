import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Engagement, EngagementFormValue, EngagementStatus } from '../models/engagement.model';
import { User, UserFormValue } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TrackerApiService {
  private readonly apiUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getUsers(search?: string): Observable<User[]> {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<User[]>(`${this.apiUrl}/users`, { params });
  }

  createUser(payload: UserFormValue): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, payload);
  }

  updateUser(id: number, payload: UserFormValue): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  getEngagements(search?: string, status?: EngagementStatus): Observable<Engagement[]> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Engagement[]>(`${this.apiUrl}/engagements`, { params });
  }

  createEngagement(payload: EngagementFormValue): Observable<Engagement> {
    return this.http.post<Engagement>(`${this.apiUrl}/engagements`, payload);
  }

  updateEngagement(id: number, payload: EngagementFormValue): Observable<Engagement> {
    return this.http.put<Engagement>(`${this.apiUrl}/engagements/${id}`, payload);
  }

  deleteEngagement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/engagements/${id}`);
  }

  exportEngagementsPdf(search?: string, status?: string): Observable<Blob> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/export/engagements/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  exportUsersPdf(search?: string): Observable<Blob> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/export/users/pdf`, {
      params,
      responseType: 'blob'
    });
  }
}