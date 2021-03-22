import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Candidate } from "./candidate.entity";

@Entity()
export class Pengalaman
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pengalaman: string;

    @ManyToOne(() => Candidate, candidate => candidate.pengalaman)
    candidate: Candidate
}