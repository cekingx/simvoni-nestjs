import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateEaDto } from './create-ea.dto';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from './user-role.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';

const mockUserRole: UserRole = {
  id: 1,
  role: 'role',
};
const mockUser: User = {
  id: 1,
  name: 'name',
  username: 'username',
  password: 'password',
  walletAddress: '0x',
  privateKey: '0x',
  userRole: mockUserRole,
};
const mockCreateUserDto: CreateUserDto = {
  name: 'name',
  username: 'username',
  password: 'password',
  role: 'role',
};
const mockCreateEaDto: CreateEaDto = {
  ...mockCreateUserDto,
};

const mockUserRepository = {
  createQueryBuilder: () => mockUserRepository,
  where: () => mockUserRepository,
  andWhere: () => mockUserRepository,
  innerJoinAndSelect: () => mockUserRepository,
  save: () => mockUser,
  getOne: () => mockUser,
  getMany: () => [mockUser, mockUser],
};
const mockUserRoleRepository = {
  createQueryBuilder: () => mockUserRoleRepository,
  where: () => mockUserRoleRepository,
  getOne: () => mockUserRole,
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

  it('should create an user', async () => {
    const savedUser = await service.create(mockCreateUserDto);

    expect(savedUser).toMatchObject(mockUser);
  });

  it('should create an ea', async () => {
    const savedEa = await service.createEa(mockCreateEaDto);

    expect(savedEa).toMatchObject(mockUser);
  });

  it('should return all ea', async () => {
    const userMatcher = [mockUser, mockUser];
    const ea = await service.findAllElectionAuthority();

    expect(ea).toMatchObject(userMatcher);
  });

  it('should return an ea', async () => {
    const ea = await service.findElectionAuthorityById(1);

    expect(ea).toMatchObject(mockUser);
  });

  it('should return an user', async () => {
    const user = await service.findOne('username');

    expect(user).toMatchObject(mockUser);
  });
});
