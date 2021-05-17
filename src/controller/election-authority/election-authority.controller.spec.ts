import { Test, TestingModule } from '@nestjs/testing';
import { CandidateDto } from 'src/elections/dto/candidate.dto';
import { CreateElectionDto } from 'src/elections/dto/create-election.dto';
import {
  ElectionParticipantDto,
  ParticipantDto,
  ParticipationDto,
} from 'src/elections/dto/election-participant.dto';
import { ElectionDto } from 'src/elections/dto/election.dto';
import { ElectionParticipant } from 'src/elections/entity/election-participant.entity';
import { Election } from 'src/elections/entity/election.entity';
import { User } from 'src/users/user.entity';
import { ElectionService } from '../../elections/election/election.service';
import { ElectionAuthorityController } from './election-authority.controller';

const mockStatus = {
  id: 1,
  status: 'status',
};
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
  name: 'election',
  description: 'description',
  start: 'start',
  end: 'end',
  contractAddress: '0x',
  status: mockStatus,
  electionAuthority: mockUser,
};
const mockCandidate = {
  id: 1,
  name: 'Candidate',
  nameSlug: 'candidate',
  visi: 'visi',
  misi: [
    {
      id: 1,
      misi: 'misi',
    },
  ],
  pengalaman: [
    {
      id: 1,
      pengalaman: 'pengalaman',
    },
  ],
};
const mockElectionArray = [mockElection, mockElection];
const mockElectionDto: ElectionDto = {
  id: mockElection.id,
  name: mockElection.name,
  description: mockElection.description,
  start: mockElection.start,
  end: mockElection.end,
  status: mockElection.status.status,
  ea: mockElection.electionAuthority.username,
};
const mockCandidateDto: CandidateDto = {
  id: mockCandidate.id,
  name: mockCandidate.name,
  visi: mockCandidate.visi,
  misi: ['misi'],
  pengalaman: ['pengalaman'],
};
const mockParticipant: ElectionParticipant = {
  id: 1,
  election: mockElection,
  participant: mockUser,
  status: mockStatus,
};
const mockParticipantArray = [mockParticipant, mockParticipant];
const mockParticipantDto: ParticipantDto = {
  participationId: mockParticipant.id,
  userId: mockUser.id,
  username: mockUser.username,
  status: 'status',
};

const mockElectionService = {
  getElectionByUsername: () => mockElectionArray,
  createElection: () => mockElection,
  getCandidatesByElectionId: () => [mockCandidate, mockCandidate],
  getElectionById: () => mockElection,
  getElectionParticipant: () => mockParticipantArray,
};

describe('ElectionAuthorityController', () => {
  let controller: ElectionAuthorityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectionAuthorityController],
      providers: [
        {
          provide: ElectionService,
          useValue: mockElectionService,
        },
      ],
    }).compile();

    controller = module.get<ElectionAuthorityController>(
      ElectionAuthorityController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all election by username', async () => {
    const responseMatcher = {
      message: 'Success',
      data: [mockElectionDto, mockElectionDto],
    };

    const spy = jest.spyOn(mockElectionService, 'getElectionByUsername');
    const response = await controller.getElectionByUsername({
      user: { username: 'username' },
    });

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should create election', async () => {
    const createElectionDto: CreateElectionDto = {
      name: mockElection.name,
      description: mockElection.description,
      start: mockElection.start,
      end: mockElection.end,
    };

    const responseMatcher = {
      message: 'Success',
      data: mockElectionDto,
    };

    const spy = jest.spyOn(mockElectionService, 'createElection');
    const response = await controller.createElection(createElectionDto, {
      user: { username: 'username' },
    });

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should return all candidates of an election', async () => {
    const responseData = [mockCandidateDto, mockCandidateDto];
    const responseMatcher = {
      message: 'Success',
      data: responseData,
    };

    const spy = jest.spyOn(mockElectionService, 'getCandidatesByElectionId');
    const response = await controller.getCandidatesByElectionId(1);

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should return all participants of an election', async () => {
    const responseData: ElectionParticipantDto = {
      electionId: mockElection.id,
      electionName: mockElection.name,
      participant: [mockParticipantDto, mockParticipantDto],
    };
    const responseMatcher = {
      message: 'Success',
      data: responseData,
    };

    const spy = jest.spyOn(mockElectionService, 'getElectionParticipant');
    const response = await controller.getElectionParticipantByElectionId(1);

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });
});
