import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Currency } from 'src/entities/currency.entity';
import { CurrencyRate } from 'src/entities/currency-rate.entity';
import { retry, sleep } from 'src/helpers/currency-helpers';

@Injectable()
export class CurrencyService implements OnModuleInit {
  private REQUEST_LIMIT = 30;
  private pause = 60000 / this.REQUEST_LIMIT;
  private apiKey: string;
  private apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(CurrencyRate)
    private currencyRateRepository: Repository<CurrencyRate>,
  ) {}

  async onModuleInit() {
    this.apiKey = this.configService.get<string>('COINMARKETCAP_API_KEY');
    this.apiUrl = this.configService.get<string>('API_URL');
    if (!this.apiKey) {
      throw new Error('API key is not defined');
    }

    // Run the fetchAndSaveCurrencyRates function in the background, not block app
    setTimeout(() => this.fetchAndSaveCurrencyRates(), 0);
  }

  @Cron('0 * * * *')
  async fetchAndSaveCurrencyRates() {
    try {
      const currencies = await this.fetchCurrencies();
      if (currencies.length) {
        await this.saveCurrencies(currencies);
        await this.fetchAndSaveRates(currencies);
      }
    } catch (error) {
      throw new Error(
        `Error occurred during conversion process: ${error.message}`,
      );
    }
  }

  private async fetchCurrencies(): Promise<Currency[]> {
    const url = `${this.apiUrl}/v1/fiat/map`;
    const response = await retry(
      () =>
        lastValueFrom(
          this.httpService
            .get(url, {
              headers: { 'X-CMC_PRO_API_KEY': this.apiKey },
            })
            .pipe(
              catchError((error) => {
                throw new Error(
                  `Failed to fetch currency data: ${error.message}`,
                );
              }),
            ),
        ),
      this.pause,
    );

    return response.data?.data || [];
  }

  private async saveCurrencies(currencies: Currency[]) {
    await this.currencyRepository.save(
      currencies.map((currency) => ({
        id: currency.id,
        name: currency.name,
        sign: currency.sign,
        symbol: currency.symbol,
      })),
    );
  }

  private async fetchAndSaveRates(currencies: Currency[]) {
    for (const fromCurrency of currencies) {
      await sleep(this.pause);
      await this.fetchAndSaveRateForCurrency(fromCurrency, currencies);
    }
  }

  private async fetchAndSaveRateForCurrency(
    fromCurrency: Currency,
    currencies: Currency[],
  ) {
    const rateUrl = `${this.apiUrl}/v2/cryptocurrency/quotes/latest`;
    const ids = currencies.map((currency) => currency.id).join(',');

    const rateResponse = await retry(
      () =>
        lastValueFrom(
          this.httpService
            .get(rateUrl, {
              headers: { 'X-CMC_PRO_API_KEY': this.apiKey },
              params: { id: ids, convert: fromCurrency.symbol },
            })
            .pipe(
              catchError((error) => {
                throw new Error(
                  `Failed to fetch conversion rates: ${error.message}`,
                );
              }),
            ),
        ),
      this.pause,
    );

    const data = rateResponse.data?.data || [];
    await this.saveRates(fromCurrency, currencies, data);
  }

  private async saveRates(
    fromCurrency: Currency,
    currencies: Currency[],
    data: any,
  ) {
    for (const rateCurrency of currencies) {
      if (fromCurrency.id !== rateCurrency.id) {
        const rate =
          data[rateCurrency.id]?.quote?.[fromCurrency.symbol]?.price || null;

        if (rate !== null) {
          const existingRate = await this.currencyRateRepository.findOne({
            where: {
              fromCurrency: { id: fromCurrency.id },
              toCurrency: { id: rateCurrency.id },
            },
          });

          if (existingRate) {
            existingRate.rate = rate;
            existingRate.lastUpdated = new Date();
            await this.currencyRateRepository.save(existingRate);
          } else {
            await this.currencyRateRepository.save({
              fromCurrency,
              toCurrency: rateCurrency,
              rate,
              lastUpdated: new Date(),
            });
          }
        }
      }
    }
  }
}
