import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Currency {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sign: string;

  @Column({ unique: true })
  symbol: string;
}
