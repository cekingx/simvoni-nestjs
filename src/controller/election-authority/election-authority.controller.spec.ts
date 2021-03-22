import { Test, TestingModule } from '@nestjs/testing';
import { ElectionAuthorityController } from './election-authority.controller';

describe('ElectionAuthorityController', () => {
  let controller: ElectionAuthorityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectionAuthorityController],
    }).compile();

    controller = module.get<ElectionAuthorityController>(ElectionAuthorityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
