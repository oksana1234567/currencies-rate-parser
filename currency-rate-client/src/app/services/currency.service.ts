import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BaseAPIService } from './base-api.service';
import { CurrencyRateResponse } from '../types/currency.interface';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService extends BaseAPIService {
  constructor() {
    super();
  }

  getCurrencyRates(requestParams: {
    fromCurrency: string;
    page: number;
    limit: number;
    filter: string[];
  }) {
    const { fromCurrency, page, limit, filter } = requestParams;
    const params = new HttpParams()
      .set('convert', fromCurrency)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('filter', filter.join(','));

    return this.get<CurrencyRateResponse>('conversion/rate', params);
  }
}
