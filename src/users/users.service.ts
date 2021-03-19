import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from './user-role.entity';
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserRole)
        private userRoleRepository: Repository<UserRole>
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User>
    {
        const user = new User();
        const role = await this.userRoleRepository
                                .createQueryBuilder('user_role')
                                .where("user_role.role = :role", {role: createUserDto.role})
                                .getOne();

        user.name           = createUserDto.name;
        user.username       = createUserDto.username;
        user.userRole       = role;

        user.password       = await this.hashPassword(createUserDto.password);

        return this.userRepository.save(user);
    }

    findAll(): Promise<User[]>
    {
        return this.userRepository.find();
    }

    findAllElectionAuthority(): Promise<User[]>
    {
        return this.userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.userRole', 'user_role')
            .where("user_role.role = :role", {role: "election_authority"})
            .getMany();
    }

    findOne(username: string): Promise<User>
    {
        return this.userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect("user.userRole", 'user_role')
            .where("user.username = :username", {username: username})
            .getOne();
    }

    hashPassword(password: string): Promise<string>
    {
        const saltOrRound = 10;
        return bcrypt.hash(password, saltOrRound);
    }
}
