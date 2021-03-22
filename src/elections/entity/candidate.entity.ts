import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Election } from "./election.entity";
import { Misi } from "./misi.entity";
import { Pengalaman } from "./pengalaman.entity";

@Entity()
export class Candidate
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    visi: string;

    @ManyToOne(() => Election, election => election.name)
    election: Election

    @OneToMany(() => Misi, misi => misi.candidate)
    misi: Misi[]

    @OneToMany(() => Pengalaman, pengalaman => pengalaman.candidate)
    pengalaman: Pengalaman[]
}