import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseAPIService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private apiUrl = environment.apiUrl;

  constructor() {}

  protected get<T>(endpoint: string, params: HttpParams) {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.notificationService.show(
          'Failed to load data. Please try again later.'
        );
        return throwError(error);
      })
    );
  }
}
