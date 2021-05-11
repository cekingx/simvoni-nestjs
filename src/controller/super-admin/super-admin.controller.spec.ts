import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/user.entity';
import { ElectionService } from '../../elections/election/election.service';
import { EthereumElectionService } from '../../ethereum/election/ethereum-election.service';
import { WalletService } from '../../ethereum/wallet/wallet.service';
import { ErrorResponseService } from '../../helper/error-response/error-response.service';
import { UsersService } from '../../users/users.service';
import { SuperAdminController } from './super-admin.controller';
import { UserDto } from 'src/users/user.dto';
import { CreateEaDto } from 'src/users/create-ea.dto';
import { Election } from 'src/elections/entity/election.entity';
import { ElectionDto } from 'src/elections/dto/election.dto';
import { Candidate } from 'src/elections/entity/candidate.entity';

const mockStatus = {
  id: 1,
  status: 'status',
};
const mockUser: User = {
  id: 1,
  name: 'satu',
  username: 'satu',
  password: 'password',
  walletAddress: '0x',
  privateKey: '0x',
  userRole: {
    id: 1,
    role: 'election_authority',
  },
};
const mockUserNullAddress: User = {
  ...mockUser,
  walletAddress: null,
  privateKey: null,
};
const mockCreateEADto: CreateEaDto = {
  name: 'name',
  username: 'username',
  password: 'password',
};
const mockUserDto: UserDto = {
  id: mockUser.id,
  name: mockUser.name,
  username: mockUser.username,
  walletAddress: mockUser.walletAddress,
  privateKey: mockUser.privateKey,
  role: mockUser.userRole.role,
};
const mockUserNullAddressDto: UserDto = {
  id: mockUserNullAddress.id,
  name: mockUserNullAddress.name,
  username: mockUserNullAddress.username,
  walletAddress: mockUserNullAddress.walletAddress,
  privateKey: mockUserNullAddress.privateKey,
  role: mockUserNullAddress.userRole.role,
};
const mockResObject = {
  status: () => mockResObject,
  json: (object) => object,
};
const mockElection: Election = {
  id: 1,
  name: 'election',
  description: 'description',
  electionAuthority: mockUser,
  status: mockStatus,
  start: 'start',
  end: 'end',
  contractAddress: '0x',
};
const mockElectionDto: ElectionDto = {
  id: mockElection.id,
  name: mockElection.name,
  description: mockElection.description,
  start: mockElection.start,
  end: mockElection.end,
  status: mockElection.status.status,
  ea: mockElection.electionAuthority.username,
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

describe('SuperAdminController', () => {
  let controller: SuperAdminController;
  const mockUserService = {
    findAllElectionAuthority: () => [mockUser, mockUser],
    findElectionAuthorityById: () => mockUser,
    findOne: () => mockUser,
    createEa: () => mockUserNullAddress,
    updateUser: () => mockUser,
  };
  const mockErrorResponseService = {};
  const mockWalletService = {
    createAccount: () => ({
      address: '0x',
      privateKey: '0x',
    }),
    sendEther: () => jest.fn(),
  };
  const mockElectionService = {
    getReadyToDeployElection: () => [mockElection, mockElection],
    getElectionById: () => mockElection,
    getCandidatesSlugByElectionId: () => [mockCandidateSlug, mockCandidateSlug],
    updateElectionAddress: () => jest.fn(),
    updateElectionStatus: () => jest.fn(),
  };
  const mockEthereumElectionService = {
    deployContract: () => '0x',
    connectToContract: () => jest.fn(),
    registerCandidate: () => 'receipt',
    getNumCandidates: () => 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: ErrorResponseService,
          useValue: mockErrorResponseService,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        {
          provide: ElectionService,
          useValue: mockElectionService,
        },
        {
          provide: EthereumElectionService,
          useValue: mockEthereumElectionService,
        },
      ],
    }).compile();

    controller = module.get<SuperAdminController>(SuperAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all election authority', async () => {
    const responseData = [mockUserDto, mockUserDto];
    const responseMatcher = {
      message: 'Success',
      data: responseData,
    };

    const spy = jest.spyOn(mockUserService, 'findAllElectionAuthority');
    const response = await controller.getAllElectionAuthority();

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should return specific election authority', async () => {
    const responseMatcher = {
      message: 'Success',
      data: mockUserDto,
    };

    const spy = jest.spyOn(mockUserService, 'findElectionAuthorityById');
    const response = await controller.getElectionAuthorityById(
      1,
      mockResObject,
    );

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should create election authority', async () => {
    const responseMatcher = {
      message: 'Success',
      data: mockUserNullAddressDto,
    };

    const spy = jest.spyOn(mockUserService, 'createEa');
    const response = await controller.createElectionAuthority(
      mockCreateEADto,
      mockResObject,
    );

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should set wallet address', async () => {
    const responseMatcher = {
      message: 'Success',
      data: {
        address: '0x',
      },
    };

    mockUserService.findElectionAuthorityById = () => mockUserNullAddress;
    const spyOne = jest.spyOn(mockUserService, 'findElectionAuthorityById');
    const spyTwo = jest.spyOn(mockWalletService, 'createAccount');
    const spyThree = jest.spyOn(mockUserService, 'updateUser');
    const response = await controller.setEaWalletAddress(1, mockResObject);

    expect(spyOne).toHaveBeenCalled();
    expect(spyTwo).toHaveBeenCalled();
    expect(spyThree).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should get ready-to-deploy election', async () => {
    const responseMatcher = {
      message: 'Success',
      data: [mockElectionDto, mockElectionDto],
    };

    const spy = jest.spyOn(mockElectionService, 'getReadyToDeployElection');
    const response = await controller.getReadyToDeployElection();

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should deploy election', async () => {
    const responseMatcher = {
      message: 'Success',
      data: {
        address: '0x',
      },
    };

    const spyElectionServiceOne = jest.spyOn(
      mockElectionService,
      'getElectionById',
    );
    const spyElectionServiceTwo = jest.spyOn(
      mockElectionService,
      'getCandidatesSlugByElectionId',
    );
    const spyElectionServiceThree = jest.spyOn(
      mockElectionService,
      'updateElectionAddress',
    );
    const spyElectionServiceFour = jest.spyOn(
      mockElectionService,
      'updateElectionStatus',
    );
    const spyUserServiceOne = jest.spyOn(mockUserService, 'findOne');
    const spyUserServiceTwo = jest.spyOn(
      mockUserService,
      'findElectionAuthorityById',
    );
    const spyWalletService = jest.spyOn(mockWalletService, 'sendEther');
    const spyEthereumServiceOne = jest.spyOn(
      mockEthereumElectionService,
      'deployContract',
    );
    const spyEthereumServiceTwo = jest.spyOn(
      mockEthereumElectionService,
      'connectToContract',
    );
    const spyEthereumServiceThree = jest.spyOn(
      mockEthereumElectionService,
      'registerCandidate',
    );
    const response = await controller.deployElection(1);

    expect(spyElectionServiceOne).toHaveBeenCalled();
    expect(spyElectionServiceTwo).toHaveBeenCalled();
    expect(spyElectionServiceThree).toHaveBeenCalled();
    expect(spyElectionServiceFour).toHaveBeenCalled();
    expect(spyUserServiceOne).toHaveBeenCalled();
    expect(spyUserServiceTwo).toHaveBeenCalled();
    expect(spyWalletService).toHaveBeenCalled();
    expect(spyEthereumServiceOne).toHaveBeenCalled();
    expect(spyEthereumServiceTwo).toHaveBeenCalled();
    expect(spyEthereumServiceThree).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });

  it('should return number of candidates', async () => {
    const responseMatcher = {
      message: 'Success',
      data: 1,
    };

    const spyOne = jest.spyOn(mockEthereumElectionService, 'connectToContract');
    const spyTwo = jest.spyOn(mockEthereumElectionService, 'getNumCandidates');
    const response = await controller.getNumCandidates('0x');

    expect(spyOne).toHaveBeenCalled();
    expect(spyTwo).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });
});

describe('SuperAdminController error handling', () => {
  let controller: SuperAdminController;
  const mockUserService = {
    findAllElectionAuthority: () => [mockUser, mockUser],
    findElectionAuthorityById: () => [],
  };
  const mockErrorResponseService = {
    notFound: () => ({
      message: 'Not Found',
      code: 'NOT_FOUND',
    }),
  };
  const mockWalletService = {};
  const mockElectionService = {};
  const mockEthereumElectionService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: ErrorResponseService,
          useValue: mockErrorResponseService,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        {
          provide: ElectionService,
          useValue: mockElectionService,
        },
        {
          provide: EthereumElectionService,
          useValue: mockEthereumElectionService,
        },
      ],
    }).compile();

    controller = module.get<SuperAdminController>(SuperAdminController);
  });

  it('should throw error if EA not found', async () => {
    const responseMatcher = {
      message: 'Not Found',
      code: 'NOT_FOUND',
    };

    const spy = jest.spyOn(mockUserService, 'findElectionAuthorityById');
    const response = await controller.getElectionAuthorityById(
      1,
      mockResObject,
    );

    expect(spy).toHaveBeenCalled();
    expect(response).toMatchObject(responseMatcher);
  });
});
