import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserRole } from './user-role.entity';
import { UpgradeRole } from './upgrade-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, UpgradeRole])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
