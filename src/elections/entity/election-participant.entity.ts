import { User } from 'src/users/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Election } from './election.entity';
import { ParticipationStatus } from './participation-status.entity';

@Entity()
export class ElectionParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Election, (election) => election.name)
  election: Election;

  @ManyToOne(() => User, (user) => user.name)
  participant: User;

  @ManyToOne(() => ParticipationStatus, (status) => status.status)
  status: ParticipationStatus;
}
