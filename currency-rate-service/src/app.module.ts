import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Currency } from 'src/entities/currency.entity';
import { CurrencyRate } from 'src/entities/currency-rate.entity';
import { ConversionService } from './conversion/conversion.service';
import { CurrencyService } from './currency/currency.service';
import { ConversionController } from './conversion/conversion.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Currency, CurrencyRate]),
    ScheduleModule.forRoot(),
    HttpModule,
    ConfigModule.forRoot(),
  ],
  providers: [ConversionService, CurrencyService],
  controllers: [ConversionController],
})
export class AppModule {}
