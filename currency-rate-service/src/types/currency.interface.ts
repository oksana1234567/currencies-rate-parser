export interface Currency {
  id: number;
  name: string;
  sign: string;
  symbol: string;
}

export interface CurrencyRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: string;
  lastUpdated: Date;
}
