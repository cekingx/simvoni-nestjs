import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Election } from './election.entity';

@Entity()
export class Weight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  weight: number;

  @ManyToOne(() => Election)
  election: Election;
}
