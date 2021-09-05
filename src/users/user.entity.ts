import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  username: string;

  @Column()
  password: string;

  @Column({
    nullable: true,
  })
  walletAddress: string;

  @Column({
    nullable: true,
  })
  randomSeed: string;

  @ManyToOne(() => UserRole, (userRole) => userRole.role)
  userRole: UserRole;
}
