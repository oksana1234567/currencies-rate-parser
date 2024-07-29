import { Controller, Get, Query } from '@nestjs/common';
import { ConversionService } from './conversion.service';

@Controller('conversion')
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Get('rate')
  async convertPrice(
    @Query('convert') convert: string = 'USD',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter: string = '',
  ) {
    const filterArray = filter ? filter.split(',') : [];
    return this.conversionService.getCurrencyRates(
      convert,
      page,
      limit,
      filterArray,
    );
  }
}
