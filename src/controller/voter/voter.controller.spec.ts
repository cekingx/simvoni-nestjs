import { Test, TestingModule } from '@nestjs/testing';
import {
  ParticipationDto,
  UserParticipationDto,
} from 'src/elections/dto/election-participant.dto';
import { ElectionParticipant } from 'src/elections/entity/election-participant.entity';
import { Election } from 'src/elections/entity/election.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from '../../users/users.service';
import { ElectionService } from '../../elections/election/election.service';
import { VoterController } from './voter.controller';

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
  electionAuthority: mockUser,
  start: 'start',
  end: 'end',
  contractAddress: '0x',
  status: mockStatus,
};
const mockParticipant: ElectionParticipant = {
  id: 1,
  election: mockElection,
  participant: mockUser,
  status: mockStatus,
};
const mockParticipationDto: ParticipationDto = {
  participationId: 1,
  electionId: mockElection.id,
  election: mockElection.name,
  status: mockStatus.status,
};
const mockUserParticipationDto: UserParticipationDto = {
  userId: mockUser.id,
  username: mockUser.username,
  participation: [mockParticipationDto, mockParticipationDto],
};

const mockUserService = {
  findOne: () => mockUser,
};

const mockElectionService = {
  getUserParticipation: () => [mockParticipant, mockParticipant],
};

describe('VoterController', () => {
  let controller: VoterController;
  let electionService: ElectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoterController],
      providers: [
        {
          provide: ElectionService,
          useValue: mockElectionService,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<VoterController>(VoterController);
    electionService = module.get<ElectionService>(ElectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('User Participation', () => {
    it('should get user participation', async () => {
      const req = {
        user: {
          username: 'username',
        },
      };
      const responseMatcher = {
        message: 'Success',
        data: mockUserParticipationDto,
      };

      const spy = jest.spyOn(mockElectionService, 'getUserParticipation');
      const response = await controller.getElectionParticipation(req);
      expect(spy).toHaveBeenCalled();
      expect(response).toMatchObject(responseMatcher);
    });

    it('should vote on an election', async () => {
      jest.fn();
    });

    it('should return voting result', async () => {
      jest.fn();
    });
  });
});
