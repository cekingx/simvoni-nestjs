import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ElectionStatus
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string;
}