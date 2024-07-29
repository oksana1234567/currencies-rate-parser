import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from 'src/entities/currency.entity';
import { CurrencyRate } from 'src/entities/currency-rate.entity';

@Injectable()
export class ConversionService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(CurrencyRate)
    private readonly currencyRateRepository: Repository<CurrencyRate>,
  ) {}

  async getCurrencyRates(
    baseCurrency: string,
    page: number,
    limit: number,
    filter: string[] = [],
  ) {
    const baseCurrencyEntity = await this.currencyRepository.findOne({
      where: { symbol: baseCurrency },
    });

    if (!baseCurrencyEntity) {
      throw new HttpException(
        'Base currency not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const query = this.currencyRateRepository
      .createQueryBuilder('rate')
      .leftJoinAndSelect('rate.baseCurrency', 'baseCurrency')
      .leftJoinAndSelect('rate.toCurrency', 'toCurrency')
      .where('baseCurrency.symbol = :baseCurrency', { baseCurrency });

    if (filter.length > 0) {
      query.andWhere('toCurrency.symbol IN (:...filter)', { filter });
    }

    const total = await query.getCount();
    const rates = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const data = rates.map((rate) => ({
      id: rate.id,
      rate: rate.rate,
      lastUpdated: rate.lastUpdated,
      baseCurrencyId: rate.baseCurrency.id,
      toCurrency: {
        id: rate.toCurrency.id,
        name: rate.toCurrency.name,
        sign: rate.toCurrency.sign,
        symbol: rate.toCurrency.symbol,
      },
    }));

    return { page, limit, total, data };
  }
}
