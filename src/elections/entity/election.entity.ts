import { User } from "src/users/user.entity";
import { Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ElectionStatus } from "./election-status.entity";

export class Election
{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToOne(() => User, electionAuthority => electionAuthority.name)
    electionAuthority: User;

    @ManyToOne(() => ElectionStatus, status => status.status)
    status: ElectionStatus;

    @Column({
        type: 'date'
    })
    start: Date;

    @Column({
        type: 'date'
    })
    end: Date;

    @Column()
    contractAddress: string;
}