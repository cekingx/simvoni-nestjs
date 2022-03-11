import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UpgradeRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isUpgraded: boolean;

  @ManyToOne(() => User, (user) => user.name)
  user: User;
}
