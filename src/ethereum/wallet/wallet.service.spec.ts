import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require('web3');
jest.mock('web3', () => jest.fn());
web3.mockImplementation(() => jest.fn());

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: 'web3',
          useValue: web3,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
