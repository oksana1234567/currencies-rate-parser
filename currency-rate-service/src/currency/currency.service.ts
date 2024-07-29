import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
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
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(CurrencyRate)
    private currencyRateRepository: Repository<CurrencyRate>,
  ) {}

  async onModuleInit() {
    await this.fetchAndSaveCurrencyRates();
  }

  @Cron('0 * * * *')
  async fetchAndSaveCurrencyRates() {
    const apiKey = this.configService.get<string>('COINMARKETCAP_API_KEY');
    const apiUrl = this.configService.get<string>('API_URL');

    if (!apiKey) {
      throw new HttpException(
        'API key is not defined',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const url = `${apiUrl}/v1/fiat/map`;

    try {
      const response = await retry(() =>
        lastValueFrom(
          this.httpService
            .get(url, {
              headers: { 'X-CMC_PRO_API_KEY': apiKey },
            })
            .pipe(
              catchError((error) => {
                throw new HttpException(
                  `Failed to fetch currency data: ${error.message}`,
                  HttpStatus.BAD_REQUEST,
                );
              }),
            ),
        ),
      );

      const currencies: Currency[] = response.data.data;
      await this.currencyRepository.save(
        currencies.map((currency) => ({
          id: currency.id,
          name: currency.name,
          sign: currency.sign,
          symbol: currency.symbol,
        })),
      );

      const REQUEST_LIMIT = 30;
      const pause = 60000 / REQUEST_LIMIT;

      for (const fromCurrency of currencies) {
        await sleep(pause);

        const rateUrl = `${apiUrl}/v2/cryptocurrency/quotes/latest`;
        const ids = currencies.map((currency) => currency.id).join(',');

        const rateResponse = await retry(() =>
          lastValueFrom(
            this.httpService
              .get(rateUrl, {
                headers: { 'X-CMC_PRO_API_KEY': apiKey },
                params: { id: ids, convert: fromCurrency.symbol },
              })
              .pipe(
                catchError((error) => {
                  throw new HttpException(
                    `Failed to fetch conversion rates: ${error.message}`,
                    HttpStatus.BAD_REQUEST,
                  );
                }),
              ),
          ),
        );

        const data = rateResponse.data.data;

        for (const rateCurrency of currencies) {
          if (fromCurrency.id !== rateCurrency.id) {
            const rate =
              data[rateCurrency.id]?.quote?.[fromCurrency.symbol]?.price ||
              null;

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
    } catch (error) {
      throw new HttpException(
        `Error occurred during conversion process: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
