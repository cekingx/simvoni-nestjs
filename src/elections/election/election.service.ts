import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateElectionDto } from '../dto/create-election.dto';
import { Candidate } from '../entity/candidate.entity';
import { ElectionStatus } from '../entity/election-status.entity';
import { Election } from '../entity/election.entity';
import { Misi } from '../entity/misi.entity';
import { Pengalaman } from '../entity/pengalaman.entity';
import { User } from "../../users/user.entity";

@Injectable()
export class ElectionService {
    constructor(
        @InjectRepository(ElectionStatus)
        private electionStatusRepository    : Repository<ElectionStatus>,

        @InjectRepository(Election)
        private electionRepository          : Repository<Election>,

        @InjectRepository(Candidate)
        private candidateRepository         : Repository<Candidate>,

        @InjectRepository(Misi)
        private misiRepository              : Repository<Misi>,

        @InjectRepository(Pengalaman)
        private pengalamanRepository        : Repository<Pengalaman>,

        @InjectRepository(User)
        private userRepository              : Repository<User>
    ) { }

    async createElection(createElectionDto: CreateElectionDto, election_authority: string): Promise<Election>
    {
        const election  = new Election();
        const status    = await this.electionStatusRepository
                                .createQueryBuilder('election_status')
                                .where("election_status.status = 'waiting_approval'")
                                .getOne();
        const ea        = await this.userRepository
                                .createQueryBuilder('user')
                                .where('user.username = :username', { username: election_authority })
                                .getOne();

        election.name               = createElectionDto.name;
        election.description        = createElectionDto.description;
        election.start              = createElectionDto.start;
        election.end                = createElectionDto.end;
        election.status             = status;
        election.electionAuthority  = ea;

        return this.electionRepository.save(election);
    }

    async validateEa(username: string, electionId: number): Promise<boolean>
    {
        const ea            = await this.userRepository
                                    .createQueryBuilder('user')
                                    .innerJoinAndSelect('user.userRole', 'user_role')
                                    .where('user.username = :username', { username: username })
                                    .getOne();

        const election      = await this.electionRepository
                                    .createQueryBuilder('election')
                                    .innerJoinAndSelect('election.electionAuthority', 'election_authority')
                                    .where('election.id = :id', { id: electionId })
                                    .getOne();

        const isEa = ea.userRole.role == 'election_authority' ? true : false;
        const isElectionCreator = election.electionAuthority.id == ea.id ? true : false;
        console.log(ea);
        console.log(election);

        if(isEa && isElectionCreator) {
            return true;
        }

        return false;
    }
}
