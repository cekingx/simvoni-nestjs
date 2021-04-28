import { Test, TestingModule } from '@nestjs/testing';
import { EthereumElectionService } from './ethereum-election.service';

describe('ElectionService', () => {
  let service: EthereumElectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EthereumElectionService],
    }).compile();

    service = module.get<EthereumElectionService>(EthereumElectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
