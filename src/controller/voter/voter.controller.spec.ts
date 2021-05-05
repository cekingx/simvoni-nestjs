import { Test, TestingModule } from '@nestjs/testing';
import { ElectionService } from '../../elections/election/election.service';
import { VoterController } from './voter.controller';

describe('VoterController', () => {
  let controller: VoterController;
  let electionService: ElectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoterController],
      providers: [
        {
          provide: ElectionService,
          useFactory: () => ({
            getUserParticipation: jest.fn(() => true),
          }),
        },
      ],
    }).compile();

    controller = module.get<VoterController>(VoterController);
    electionService = module.get<ElectionService>(ElectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('User Participation', () => {
    it('should get user participation', async () => {
      const req = {
        user: {
          username: 'voter-satu',
        },
      };
      controller.getElectionParticipation(req);
      expect(electionService.getUserParticipation).toHaveBeenCalled();
    });
  });
});
