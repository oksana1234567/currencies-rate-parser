import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { CurrencyRateResponse } from '../types/currency.interface';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getCurrencyRates(
    baseCurrency: string,
    page: number,
    limit: number,
    filter: string[]
  ) {
    return this.http
      .get<CurrencyRateResponse>(`${this.apiUrl}/conversion/rate`, {
        params: {
          convert: baseCurrency,
          page: page.toString(),
          limit: limit.toString(),
          filter: filter.join(','),
        },
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.notificationService.show(
            'Failed to load data. Please try again later.'
          );
          return throwError(error);
        })
      );
  }
}
