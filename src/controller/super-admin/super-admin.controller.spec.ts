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

describe('SuperAdminController', () => {
  let controller: SuperAdminController;
  const mockUserService = {
    findAllElectionAuthority: () => [mockUser, mockUser],
    findElectionAuthorityById: () => mockUser,
    createEa: () => mockUserNullAddress,
    updateUser: () => mockUser,
  };
  const mockErrorResponseService = {};
  const mockWalletService = {
    methods: () => true,
    createAccount: () => ({
      address: '0x',
      privateKey: '0x',
    }),
  };
  const mockElectionService = {
    methods: () => true,
    getReadyToDeployElection: () => [mockElection, mockElection],
  };
  const mockEthereumElectionService = {
    methods: () => true,
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
