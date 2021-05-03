import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ParticipationStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;
}
