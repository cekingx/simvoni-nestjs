import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { Connection } from 'typeorm';
import { Candidate } from '../entity/candidate.entity';
import { ElectionParticipant } from '../entity/election-participant.entity';
import { ElectionStatus } from '../entity/election-status.entity';
import { Election } from '../entity/election.entity';
import { Misi } from '../entity/misi.entity';
import { Pengalaman } from '../entity/pengalaman.entity';
import { ElectionService } from './election.service';

const mockElectionStatusRepository = {};
const mockElectionRepository = {};
const mockCandidateRepository = {};
const mockMisiRepository = {};
const mockPengalamanRepository = {};
const mockUserRepository = {};
const mockElectionParticipantRepository = {};
const mockConnection = {};

describe('ElectionService', () => {
  let service: ElectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElectionService,
        {
          provide: getRepositoryToken(ElectionStatus),
          useValue: mockElectionStatusRepository,
        },
        {
          provide: getRepositoryToken(Election),
          useValue: mockElectionRepository,
        },
        {
          provide: getRepositoryToken(Candidate),
          useValue: mockCandidateRepository,
        },
        {
          provide: getRepositoryToken(Misi),
          useValue: mockMisiRepository,
        },
        {
          provide: getRepositoryToken(Pengalaman),
          useValue: mockPengalamanRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(ElectionParticipant),
          useValue: mockElectionParticipantRepository,
        },
        {
          provide: Connection,
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<ElectionService>(ElectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
