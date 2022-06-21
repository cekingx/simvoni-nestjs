import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from './user-role.entity';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateEaDto } from './create-ea.dto';
import { UpgradeRole } from './upgrade-role.entity';
import { Wallet } from 'ethers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(UpgradeRole)
    private upgradeRoleRepository: Repository<UpgradeRole>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    const role = await this.userRoleRepository
      .createQueryBuilder('user_role')
      .where('user_role.role = :role', { role: 'voter' })
      .getOne();
    const wallet = Wallet.createRandom();

    user.name = createUserDto.name;
    user.username = createUserDto.username;
    user.userRole = role;
    user.walletAddress = wallet.address;
    user.privateKey = wallet.privateKey;

    user.password = await this.hashPassword(createUserDto.password);

    return this.userRepository.save(user);
  }

  async createEa(createEaDto: CreateEaDto): Promise<User> {
    const user = new User();
    const role = await this.userRoleRepository
      .createQueryBuilder('user_role')
      .where("user_role.role = 'election_authority'")
      .getOne();
    const wallet = Wallet.createRandom();

    user.name = createEaDto.name;
    user.username = createEaDto.username;
    user.userRole = role;
    user.walletAddress = wallet.address;
    user.privateKey = wallet.privateKey;

    user.password = await this.hashPassword(createEaDto.password);

    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findAllElectionAuthority(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userRole', 'user_role')
      .where('user_role.role = :role', { role: 'election_authority' })
      .getMany();
  }

  findElectionAuthorityById(userId: number): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userRole', 'user_role')
      .where('user_role.role = :role', { role: 'election_authority' })
      .andWhere('user.id = :id', { id: userId })
      .getOne();
  }

  findOne(username: string): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userRole', 'user_role')
      .where('user.username = :username', { username: username })
      .getOne();
  }

  updateUser(user: User) {
    return this.userRepository.save(user);
  }

  hashPassword(password: string): Promise<string> {
    const saltOrRound = 10;
    return bcrypt.hash(password, saltOrRound);
  }

  async requestUpgradeRole(username: string) {
    const user = await this.findOne(username);
    const upgrade = new UpgradeRole();
    upgrade.user = user;
    upgrade.isUpgraded = false;
    return this.upgradeRoleRepository.save(upgrade);
  }

  async getUpgradeRole() {
    return this.upgradeRoleRepository
      .createQueryBuilder('upgrade')
      .innerJoinAndSelect('upgrade.user', 'user')
      .where('upgrade.isUpgraded = false')
      .getMany();
  }

  async upgradeRole(id: number) {
    const upgrade = await this.upgradeRoleRepository
      .createQueryBuilder('upgrade')
      .innerJoinAndSelect('upgrade.user', 'user')
      .where('upgrade.id = :id', { id })
      .getOne();

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: upgrade.user.id })
      .getOne();

    const role = await this.userRoleRepository
      .createQueryBuilder('role')
      .where('role.role = :role', { role: 'election_authority' })
      .getOne();

    user.userRole = role;
    await this.userRepository.save(user);
    upgrade.isUpgraded = true;
    await this.upgradeRoleRepository.save(upgrade);
  }

  async upgradeRoleStatus(username: string) {
    const user = await this.findOne(username);

    const upgrade = await this.upgradeRoleRepository
      .createQueryBuilder('upgrade')
      .innerJoinAndSelect('upgrade.user', 'user')
      .where('user.id = :id', { id: user.id })
      .getOne();

    if (!upgrade) {
      return {
        code: 0,
        value: 'Tidak Ditemukan',
      };
    }

    if (!upgrade.isUpgraded) {
      return {
        code: 1,
        value: 'Sedang Direview',
      };
    }

    if (upgrade.isUpgraded) {
      return {
        code: 2,
        value: 'Telah Diupgrade',
      };
    }

    return {
      code: 0,
      value: 'Tidak Ditemukan',
    };
  }
}
