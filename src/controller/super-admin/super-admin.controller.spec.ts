import { Test, TestingModule } from '@nestjs/testing';
import { ElectionService } from '../../elections/election/election.service';
import { EthereumElectionService } from '../../ethereum/election/ethereum-election.service';
import { WalletService } from '../../ethereum/wallet/wallet.service';
import { ErrorResponseService } from '../../helper/error-response/error-response.service';
import { UsersService } from '../../users/users.service';
import { SuperAdminController } from './super-admin.controller';

describe('SuperAdminController', () => {
  let controller: SuperAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminController],
      providers: [
        {
          provide: UsersService,
          useFactory: () => ({
            methods: jest.fn(() => true),
          }),
        },
        {
          provide: ErrorResponseService,
          useFactory: () => ({
            methods: jest.fn(() => true),
          }),
        },
        {
          provide: WalletService,
          useFactory: () => ({
            methods: jest.fn(() => true),
          }),
        },
        {
          provide: ElectionService,
          useFactory: () => ({
            methods: jest.fn(() => true),
          }),
        },
        {
          provide: EthereumElectionService,
          useFactory: () => ({
            methods: jest.fn(() => true),
          }),
        },
      ],
    }).compile();

    controller = module.get<SuperAdminController>(SuperAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
