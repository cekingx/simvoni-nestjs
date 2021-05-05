import { User } from '../../users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ElectionStatus } from './election-status.entity';

@Entity()
export class Election {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (electionAuthority) => electionAuthority.name)
  electionAuthority: User;

  @ManyToOne(() => ElectionStatus, (status) => status.status)
  status: ElectionStatus;

  @Column({
    type: 'date',
  })
  start: string;

  @Column({
    type: 'date',
  })
  end: string;

  @Column({
    nullable: true,
  })
  contractAddress: string;
}
