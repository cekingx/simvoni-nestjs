import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from "./user.entity";
import { UserRole } from "./user-role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
