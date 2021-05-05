import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { EthereumElectionService } from './ethereum/election/ethereum-election.service';
import { UsersService } from './users/users.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AuthService,
          useFactory: () => ({
            generateToken: jest.fn(() => true),
          }),
        },
        {
          provide: UsersService,
          useFactory: () => ({
            method: jest.fn(() => true),
          }),
        },
        {
          provide: EthereumElectionService,
          useFactory: () => ({
            method: jest.fn(() => true),
          }),
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController).toBeDefined();
    });
  });
});
