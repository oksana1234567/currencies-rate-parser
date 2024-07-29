import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from '../entities/currency.entity';
import { CurrencyRate } from '../entities/currency-rate.entity';
import { ConversionService } from 'src/conversion/conversion.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Currency, CurrencyRate]), HttpModule],
  providers: [ConversionService],
  exports: [TypeOrmModule, ConversionService],
})
export class CurrencyModule {}
