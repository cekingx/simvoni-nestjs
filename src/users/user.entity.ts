import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user-role.entity";

@Entity()
export class User
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    walletAddress: string

    @Column()
    privateKey: string

    @ManyToOne(() => UserRole, userRole => userRole.role)
    userRole: UserRole
}