import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateElectionDto } from '../dto/create-election.dto';
import { Candidate } from '../entity/candidate.entity';
import { ElectionStatus } from '../entity/election-status.entity';
import { Election } from '../entity/election.entity';
import { Misi } from '../entity/misi.entity';
import { Pengalaman } from '../entity/pengalaman.entity';
import { User } from '../../users/user.entity';
import { AddCandidateDto } from '../dto/add-candidate.dto';
import { ElectionParticipant } from '../entity/election-participant.entity';

@Injectable()
export class ElectionService {
  constructor(
    @InjectRepository(ElectionStatus)
    private electionStatusRepository: Repository<ElectionStatus>,

    @InjectRepository(Election)
    private electionRepository: Repository<Election>,

    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,

    @InjectRepository(Misi)
    private misiRepository: Repository<Misi>,

    @InjectRepository(Pengalaman)
    private pengalamanRepository: Repository<Pengalaman>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(ElectionParticipant)
    private electionParticipantRepository: Repository<ElectionParticipant>,

    private connection: Connection,
  ) {}

  async getElectionByUsername(username: string): Promise<Election[]> {
    const ea = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username: username })
      .getOne();

    const elections = await this.electionRepository
      .createQueryBuilder('election')
      .innerJoinAndSelect('election.electionAuthority', 'election_authority')
      .innerJoinAndSelect('election.status', 'election_status')
      .where('election_authority.id = :id', { id: ea.id })
      .getMany();

    return elections;
  }

  async getReadyToDeployElection(): Promise<Election[]> {
    const elections = await this.electionRepository
      .createQueryBuilder('election')
      .innerJoinAndSelect('election.electionAuthority', 'election_authority')
      .innerJoinAndSelect('election.status', 'election_status')
      .where('election_status.id = 2')
      .getMany();

    return elections;
  }

  async getDeployedElection(): Promise<Election[]> {
    const elections = await this.electionRepository
      .createQueryBuilder('election')
      .innerJoinAndSelect('election.electionAuthority', 'election_authority')
      .innerJoinAndSelect('election.status', 'election_status')
      .where('election_status.id = 3')
      .getMany();

    return elections;
  }

  async getElectionById(electionId: number): Promise<Election> {
    const election = await this.electionRepository
      .createQueryBuilder('election')
      .innerJoinAndSelect('election.electionAuthority', 'election_authority')
      .where('election.id = :id', { id: electionId })
      .getOne();

    return election;
  }

  async getCandidatesByElectionId(electionId: number): Promise<Candidate[]> {
    const candidates = await this.candidateRepository
      .createQueryBuilder('candidate')
      .innerJoinAndSelect('candidate.election', 'election')
      .innerJoinAndSelect('candidate.misi', 'misi')
      .innerJoinAndSelect('candidate.pengalaman', 'pengalaman')
      .where('election.id = :id', { id: electionId })
      .getMany();

    return candidates;
  }

  async getCandidatesSlugByElectionId(
    electionId: number,
  ): Promise<Candidate[]> {
    const candidates = await this.candidateRepository
      .createQueryBuilder('candidate')
      .innerJoinAndSelect('candidate.election', 'election')
      .select(['candidate.nameSlug'])
      .where('election.id = :id', { id: electionId })
      .getMany();

    return candidates;
  }

  async createElection(
    createElectionDto: CreateElectionDto,
    election_authority: string,
  ): Promise<Election> {
    const election = new Election();
    const status = await this.electionStatusRepository
      .createQueryBuilder('election_status')
      .where("election_status.status = 'waiting_approval'")
      .getOne();
    const ea = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username: election_authority })
      .getOne();

    election.name = createElectionDto.name;
    election.description = createElectionDto.description;
    election.start = createElectionDto.start;
    election.end = createElectionDto.end;
    election.status = status;
    election.electionAuthority = ea;

    return this.electionRepository.save(election);
  }

  async validateEa(username: string, electionId: number): Promise<boolean> {
    const ea = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userRole', 'user_role')
      .where('user.username = :username', { username: username })
      .getOne();

    const election = await this.electionRepository
      .createQueryBuilder('election')
      .innerJoinAndSelect('election.electionAuthority', 'election_authority')
      .where('election.id = :id', { id: electionId })
      .getOne();

    const isEa = ea.userRole.role == 'election_authority' ? true : false;
    const isElectionCreator =
      election.electionAuthority.id == ea.id ? true : false;

    if (isEa && isElectionCreator) {
      return true;
    }

    return false;
  }

  async addCandidate(addCandidateDto: AddCandidateDto, electionId: number) {
    let savedCandidate: Candidate;
    const election = await this.electionRepository
      .createQueryBuilder('election')
      .where('election.id = :id', { id: electionId })
      .getOne();

    const misiArray: Misi[] = [];
    addCandidateDto.misi.forEach((data) => {
      const misi = new Misi();
      misi.misi = data;
      misiArray.push(misi);
    });

    const pengalamanArray: Pengalaman[] = [];
    addCandidateDto.pengalaman.forEach((data) => {
      const pengalaman = new Pengalaman();
      pengalaman.pengalaman = data;
      pengalamanArray.push(pengalaman);
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const candidate = new Candidate();

      candidate.name = addCandidateDto.name;
      candidate.visi = addCandidateDto.visi;
      candidate.nameSlug = this.convertToSlug(addCandidateDto.name);
      candidate.election = election;

      savedCandidate = await queryRunner.manager.save(candidate);

      misiArray.forEach(async (misi) => {
        misi.candidate = savedCandidate;
        await queryRunner.manager.save(misi);
      });

      pengalamanArray.forEach(async (pengalaman) => {
        pengalaman.candidate = savedCandidate;
        await queryRunner.manager.save(pengalaman);
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return savedCandidate;
  }

  async updateElection(election: Election) {
    return this.electionRepository.save(election);
  }

  async updateElectionAddress(election: Election, address: string) {
    election.contractAddress = address;
    return this.electionRepository.save(election);
  }

  async updateElectionStatus(election: Election, statusId: number) {
    const status: ElectionStatus = await this.electionStatusRepository
      .createQueryBuilder('status')
      .where('id = :id', { id: statusId })
      .getOne();

    election.status = status;
    return this.electionRepository.save(election);
  }

  async getElectionParticipant(
    electionId: number,
  ): Promise<ElectionParticipant[]> {
    const participant = await this.electionParticipantRepository
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.participant', 'user')
      .innerJoinAndSelect('participant.election', 'election')
      .innerJoinAndSelect('participant.status', 'status')
      .where('election.id = :id', { id: electionId })
      .getMany();

    return participant;
  }

  async getUserParticipation(userId: number): Promise<ElectionParticipant[]> {
    const participation = await this.electionParticipantRepository
      .createQueryBuilder('participation')
      .innerJoinAndSelect('participation.participant', 'user')
      .innerJoinAndSelect('participation.election', 'election')
      .innerJoinAndSelect('participation.status', 'status')
      .where('user.id = :id', { id: userId })
      .getMany();

    return participation;
  }

  private convertToSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }
}
