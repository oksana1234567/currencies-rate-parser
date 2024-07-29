export interface Currency {
  id: number;
  name: string;
  sign: string;
  symbol: string;
}

export interface CurrencyRate {
  baseCurrency: Currency;
  toCurrency: Currency;
  rate: string;
  lastUpdated: Date;
}
