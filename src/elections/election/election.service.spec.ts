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
import { CreateElectionDto } from '../dto/create-election.dto';
import { AddCandidateDto } from '../dto/add-candidate.dto';

const mockUser: User = {
  id: 1,
  name: 'name',
  username: 'username',
  password: 'password',
  walletAddress: '0x',
  privateKey: '0x',
  userRole: {
    id: 1,
    role: 'role',
  },
};
const mockElection: Election = {
  id: 1,
  name: 'name',
  description: 'description',
  electionAuthority: mockUser,
  status: {
    id: 1,
    status: 'status',
  },
  start: 'start',
  end: 'end',
  contractAddress: '0x',
};
const mockCandidate: Candidate = {
  id: 1,
  name: 'name',
  nameSlug: 'name-slug',
  visi: 'visi',
  election: mockElection,
  misi: [
    {
      id: 1,
      misi: 'misi',
      candidate: this,
    },
  ],
  pengalaman: [
    {
      id: 1,
      pengalaman: 'pengalaman',
      candidate: this,
    },
  ],
};
const mockCandidateSlug = {
  nameSlug: 'name-slug',
};
const mockStatus = {
  id: 1,
  status: 'status',
};
const mockCreateElectionDto: CreateElectionDto = {
  name: 'name',
  description: 'description',
  start: 'start',
  end: 'end',
};
const mockAddCandidateDto: AddCandidateDto = {
  name: 'name',
  visi: 'visi',
  misi: ['misi', 'misi'],
  pengalaman: ['pengalaman', 'pengalaman'],
};
const mockElectionParticipant: ElectionParticipant = {
  id: 1,
  election: mockElection,
  participant: mockUser,
  status: mockStatus,
};

const mockElectionStatusRepository = {
  createQueryBuilder: () => mockElectionStatusRepository,
  where: () => mockElectionStatusRepository,
  getOne: () => mockStatus,
};
const mockElectionRepository = {
  createQueryBuilder: () => mockElectionRepository,
  where: () => mockElectionRepository,
  innerJoinAndSelect: () => mockElectionRepository,
  getOne: () => mockElection,
  getMany: () => [mockElection, mockElection],
  save: () => mockElection,
};
const mockCandidateRepository = {
  createQueryBuilder: () => mockCandidateRepository,
  where: () => mockCandidateRepository,
  innerJoinAndSelect: () => mockCandidateRepository,
  select: () => mockCandidateRepository,
  getOne: () => mockCandidate,
  getMany: jest.fn(),
};
const mockMisiRepository = {};
const mockPengalamanRepository = {};
const mockUserRepository = {
  createQueryBuilder: () => mockUserRepository,
  where: () => mockUserRepository,
  innerJoinAndSelect: () => mockUserRepository,
  getOne: () => mockUser,
  getMany: () => [mockUser, mockUser],
};
const mockElectionParticipantRepository = {
  createQueryBuilder: () => mockElectionParticipantRepository,
  where: () => mockElectionParticipantRepository,
  innerJoinAndSelect: () => mockElectionParticipantRepository,
  getOne: () => mockElectionParticipant,
  getMany: () => [mockElectionParticipant, mockElectionParticipant],
};
const mockConnection = {
  createQueryRunner: () => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: () => mockCandidate,
    },
  }),
};

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

  it('should return elections by username', async () => {
    const electionMatcher = [mockElection, mockElection];
    const election = await service.getElectionByUsername('username');

    expect(election).toMatchObject(electionMatcher);
  });

  it('should return ready-to-deploy election', async () => {
    const electionMatcher = [mockElection, mockElection];
    const election = await service.getReadyToDeployElection();

    expect(election).toMatchObject(electionMatcher);
  });

  it('should return deployed election', async () => {
    const electionMatcher = [mockElection, mockElection];
    const election = await service.getDeployedElection();

    expect(election).toMatchObject(electionMatcher);
  });

  it('should return election by id', async () => {
    const election = await service.getElectionById(1);

    expect(election).toMatchObject(mockElection);
  });

  it('should return candidates of election', async () => {
    const candidateMatcher = [mockCandidate, mockCandidate];
    mockCandidateRepository.getMany.mockImplementation(() => [
      mockCandidate,
      mockCandidate,
    ]);
    const candidate = await service.getCandidatesByElectionId(1);

    expect(candidate).toMatchObject(candidateMatcher);
  });

  it('should return candidates slug', async () => {
    const candidateSlugMatcher = [mockCandidateSlug, mockCandidateSlug];
    mockCandidateRepository.getMany.mockImplementation(() => [
      mockCandidateSlug,
      mockCandidateSlug,
    ]);
    const candidateSlug = await service.getCandidatesSlugByElectionId(1);

    expect(candidateSlug).toMatchObject(candidateSlugMatcher);
  });

  it('should create election', async () => {
    const election = await service.createElection(mockCreateElectionDto, 'ea');

    expect(election).toMatchObject(mockElection);
  });

  it('should validate ea', async () => {
    mockUserRepository.getOne().userRole.role = 'election_authority';
    const isValidEa = await service.validateEa('username', 1);

    expect(isValidEa).toBeTruthy();
  });

  it('should invalidate ea', async () => {
    mockUserRepository.getOne().userRole.role = 'super_admin';
    const isValidEa = await service.validateEa('username', 1);

    expect(isValidEa).toBeFalsy();
  });

  it('should add candidate to election', async () => {
    const addedCandidate = await service.addCandidate(mockAddCandidateDto, 1);

    expect(addedCandidate).toMatchObject(mockCandidate);
  });

  it('should return election participants', async () => {
    const electionParticipantMatcher = [
      mockElectionParticipant,
      mockElectionParticipant,
    ];
    const electionParticipant = await service.getElectionParticipant(1);

    expect(electionParticipant).toMatchObject(electionParticipantMatcher);
  });

  it('should return user participation', async () => {
    const userParticipationMatcher = [
      mockElectionParticipant,
      mockElectionParticipant,
    ];
    const userParticipation = await service.getUserParticipation('username');

    expect(userParticipation).toMatchObject(userParticipationMatcher);
  });
});
