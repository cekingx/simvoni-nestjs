import { Test, TestingModule } from '@nestjs/testing';
import { ElectionService } from '../../elections/election/election.service';
import { ElectionAuthorityController } from './election-authority.controller';

describe('ElectionAuthorityController', () => {
  let controller: ElectionAuthorityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectionAuthorityController],
      providers: [
        {
          provide: ElectionService,
          useFactory: () => ({
            getElectionByUsername: jest.fn(() => true),
          }),
        },
      ],
    }).compile();

    controller = module.get<ElectionAuthorityController>(
      ElectionAuthorityController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
