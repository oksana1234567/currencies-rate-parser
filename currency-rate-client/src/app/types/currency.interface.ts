export interface Currency {
  id: number;
  name: string;
  sign: string;
  symbol: string;
}

export interface CurrencyRate {
  id: number;
  fromCurrencyId: number;
  toCurrency: Currency;
  rate: string;
  lastUpdated: string;
}

export interface CurrencyRateResponse {
  page: number;
  limit: number;
  total: number;
  data: CurrencyRate[];
}
