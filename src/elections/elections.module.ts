import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionService } from './election/election.service';
import { Candidate } from './entity/candidate.entity';
import { ElectionStatus } from './entity/election-status.entity';
import { Election } from './entity/election.entity';
import { Misi } from './entity/misi.entity';
import { Pengalaman } from './entity/pengalaman.entity';
import { User } from '../users/user.entity';
import { ElectionParticipant } from './entity/election-participant.entity';
import { ParticipationStatus } from './entity/participation-status.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user-role.entity';
import { UpgradeRole } from '../users/upgrade-role.entity';
import { Weight } from './entity/weight.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElectionStatus,
      Candidate,
      Misi,
      Pengalaman,
      Election,
      User,
      ElectionParticipant,
      ParticipationStatus,
      User,
      UserRole,
      UpgradeRole,
      Weight,
    ]),
  ],
  providers: [ElectionService, UsersService],
  exports: [ElectionService],
})
export class ElectionsModule {}
