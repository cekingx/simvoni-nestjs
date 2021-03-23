import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionService } from './election/election.service';
import { Candidate } from './entity/candidate.entity';
import { ElectionStatus } from './entity/election-status.entity';
import { Election } from './entity/election.entity';
import { Misi } from './entity/misi.entity';
import { Pengalaman } from './entity/pengalaman.entity';
import { User } from "../users/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ElectionStatus,
      Candidate,
      Misi,
      Pengalaman,
      Election,
      User
    ]),
  ],
  providers: [ElectionService],
  exports: [ElectionService]
})
export class ElectionsModule {}
