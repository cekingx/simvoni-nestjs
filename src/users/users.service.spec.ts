import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from './user-role.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';

const mockUserRepository = {
  createQueryBuilder: () => mockUserRepository,
  where: () => mockUserRepository,
  save: () => ({
    id: 1,
    name: 'dirga',
    username: 'dirga',
    password: '12345',
    role: 'voter',
  }),
};
const mockUserRoleRepository = {
  createQueryBuilder: () => mockUserRoleRepository,
  where: () => mockUserRoleRepository,
  getOne: () => {
    role: 'voter';
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save an entity', async () => {
    const user: CreateUserDto = {
      name: 'dirga',
      username: 'dirga',
      password: '12345',
      role: 'voter',
    };

    const spy = jest.spyOn(mockUserRepository, 'save');
    const savedUser = await service.create(user);
    expect(spy).toHaveBeenCalled();
    expect(savedUser).toMatchObject(user);
  });
});
