import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Currency } from './currency.entity';

@Entity()
export class CurrencyRate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'from_currency_id' })
  fromCurrency: Currency;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'to_currency_id' })
  toCurrency: Currency;

  @Column('decimal', { precision: 20, scale: 10 })
  rate: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}
