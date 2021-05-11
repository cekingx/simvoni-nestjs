import { Test, TestingModule } from '@nestjs/testing';
import { EthereumElectionService } from './ethereum-election.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require('web3');

const mockContract = {
  options: {
    address: '0x12345',
  },
  methods: {
    register_candidate: () => mockContract.methods,
    send: () => mockContract,
    get_num_candidates: () => mockContract.methods,
    call: () => 1,
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
    expect(address).toMatch('0x12345');
  });

  it('should connect to contract', async () => {
    const contract = await service.connectToContract('0x');
    expect(contract).toBeTruthy();
  });

  it('should register candidate', async () => {
    const receipt = await service.registerCandidate(
      mockContract,
      'name',
      'sender',
    );

    expect(receipt).toBeTruthy();
  });

  it('should return number of candidate', async () => {
    const numCanidates = await service.getNumCandidates(mockContract);

    expect(numCanidates).toEqual(1);
  });
});
