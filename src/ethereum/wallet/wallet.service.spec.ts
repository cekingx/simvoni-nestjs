import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require('web3');
jest.mock('web3', () => jest.fn());
web3.mockImplementation(() => jest.fn());
const mockAccount = {
  privateKey: '0x',
  address: '0x',
};
const mockWeb3 = {
  eth: {
    accounts: {
      create: () => mockAccount,
    },
    personal: {
      importRawKey: () => jest.fn(),
      unlockAccount: () => mockAccount,
      sendTransaction: () => 'receipt',
    },
  },
};

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: 'web3',
          useValue: mockWeb3,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create account', async () => {
    const account = await service.createAccount('password');

    expect(account).toMatchObject(mockAccount);
  });

  it('should unlock account', async () => {
    const account = await service.unlockAccount('address', 'password');

    expect(account).toMatchObject(mockAccount);
  });

  it('should send ether', async () => {
    const receipt = await service.sendEther(
      'sender',
      'password',
      'receiver',
      'amount',
    );

    expect(receipt).toBeTruthy();
  });
});
