import { Test, TestingModule } from '@nestjs/testing';
import { EthereumElectionService } from './ethereum-election.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require('web3');
jest.mock('web3', () => jest.fn());
web3.mockImplementation(() => jest.fn());

describe('ElectionService', () => {
  let service: EthereumElectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthereumElectionService,
        {
          provide: 'web3',
          useValue: web3,
        },
      ],
    }).compile();

    service = module.get<EthereumElectionService>(EthereumElectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
