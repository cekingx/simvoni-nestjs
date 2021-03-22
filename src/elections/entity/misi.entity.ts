import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Candidate } from "./candidate.entity";

@Entity()
export class Misi
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    misi: string;

    @ManyToOne(() => Candidate, candidate => candidate.misi)
    candidate: Candidate
}