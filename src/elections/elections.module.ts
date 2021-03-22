import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionService } from './election/election.service';
import { ElectionStatus } from './entity/election-status.entity';
import { Election } from './entity/election.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Election, ElectionStatus])],
  providers: [ElectionService]
})
export class ElectionsModule {}
