import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/user.entity';
import { ElectionService } from '../../elections/election/election.service';
import { EthereumElectionService } from '../../ethereum/election/ethereum-election.service';
import { WalletService } from '../../ethereum/wallet/wallet.service';
import { ErrorResponseService } from '../../helper/error-response/error-response.service';
import { UsersService } from '../../users/users.service';
import { SuperAdminController } from './super-admin.controller';

const eaArray: User[] = [
  {
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
  },
  {
    id: 2,
    name: 'dua',
    username: 'dua',
    password: 'password',
    walletAddress: '0x',
    privateKey: '0x',
    userRole: {
      id: 1,
      role: 'election_authority',
    },
  },
];

const mockUserService = {
  methods: () => true,
  findAllElectionAuthority: () => eaArray,
};

const mockErrorResponseService = {
  methods: () => true,
};

const mockWalletService = {
  methods: () => true,
};

const mockElectionService = {
  methods: () => true,
};

const mockEthereumElectionService = {
  methods: () => true,
};

describe('SuperAdminController', () => {
  let controller: SuperAdminController;

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
    const spy = jest.spyOn(mockUserService, 'findAllElectionAuthority');
    const ea = await controller.getAllElectionAuthority();

    expect(spy).toHaveBeenCalled();
    expect(ea.data[0]).toEqual(expect.objectContaining({ name: 'satu' }));
  });
});
