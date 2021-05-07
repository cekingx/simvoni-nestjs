import { Test, TestingModule } from '@nestjs/testing';
import { EthereumElectionService } from './ethereum-election.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require('web3');

const mockContract = {
  options: {
    address: '0x12345',
  },
  deploy: () => mockContract,
  send: () => mockContract,
};

jest.mock('web3', () => jest.fn());

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
        {
          provide: 'Contract',
          useValue: mockContract,
        },
      ],
    }).compile();

    service = module.get<EthereumElectionService>(EthereumElectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should deploy contract', async () => {
    const address = await service.deployContract('0x');
    expect(address).toBeTruthy();
  });

  it('should connect to contract', async () => {
    const contract = await service.connectToContract('0x');
    expect(contract).toBeTruthy();
  });
});
