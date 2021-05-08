import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  const mockUserService = {
    id: 1,
    name: 'name',
    username: 'username',
    password: 'password',
    walletAddress: '0x',
    privateKey: '0x1',
    userRole: {
      role: 'role',
    },
    findOne: () => mockUserService,
  };

  const mockJwtService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return valid user', async () => {
    bcrypt.compare.mockImplementation(() => true);
    const spy = jest.spyOn(mockUserService, 'findOne');
    const user = await service.validateUser('username', 'password');

    expect(spy).toHaveBeenCalled();
    expect(user).toBeTruthy();
  });

  it("should return null if password doesn't match", async () => {
    bcrypt.compare.mockImplementation(() => false);
    const spy = jest.spyOn(mockUserService, 'findOne');
    const user = await service.validateUser('username', 'password');

    expect(spy).toHaveBeenCalled();
    expect(user).toBeNull();
  });
});
