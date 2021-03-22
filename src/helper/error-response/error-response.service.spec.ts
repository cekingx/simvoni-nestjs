import { Test, TestingModule } from '@nestjs/testing';
import { ErrorResponseService } from './error-response.service';

describe('ErrorResponseService', () => {
  let service: ErrorResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorResponseService],
    }).compile();

    service = module.get<ErrorResponseService>(ErrorResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
