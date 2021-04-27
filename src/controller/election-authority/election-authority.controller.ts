import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddCandidateDto } from 'src/elections/dto/add-candidate.dto';
import { CreateElectionDto } from 'src/elections/dto/create-election.dto';
import { ElectionDto } from 'src/elections/dto/election.dto';
import { ElectionService } from 'src/elections/election/election.service';
import { Election } from 'src/elections/entity/election.entity';
import { CandidateDto } from 'src/elections/dto/candidate.dto';
import { Candidate } from 'src/elections/entity/candidate.entity';
import { Misi } from 'src/elections/entity/misi.entity';
import { Pengalaman } from 'src/elections/entity/pengalaman.entity';

@Controller('election-authority')
export class ElectionAuthorityController {
  constructor(private electionService: ElectionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('elections')
  async getElectionByUsername(@Request() req) {
    const elections = await this.electionService.getElectionByUsername(
      req.user.username,
    );
    const electionDtos: ElectionDto[] = [];

    elections.forEach((election: Election) => {
      const electionDto: ElectionDto = {
        id: election.id,
        name: election.name,
        description: election.description,
        start: election.start,
        end: election.end,
        status: election.status.status,
        ea: election.electionAuthority.username,
      };

      electionDtos.push(electionDto);
    });

    return {
      message: 'Success',
      data: electionDtos,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('election')
  async createElection(
    @Body() createElectionDto: CreateElectionDto,
    @Request() req,
  ) {
    const election = await this.electionService.createElection(
      createElectionDto,
      req.user.username,
    );

    return election;
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-candidate/:electionId')
  async addCandidateToElection(
    @Body() addCandidateDto: AddCandidateDto,
    @Param('electionId') electionId: number,
    @Request() req,
  ) {
    const isValidEa = this.electionService.validateEa(
      req.user.username,
      electionId,
    );

    if (isValidEa) {
      return this.electionService.addCandidate(addCandidateDto, electionId);
    }

    return false;
  }

  @UseGuards(JwtAuthGuard)
  @Get('election/:electionId/candidates')
  async getCandidatesByElectionId(@Param('electionId') electionId: number) {
    const candidates = await this.electionService.getCandidatesByElectionId(
      electionId,
    );
    const candidatesDto: CandidateDto[] = [];

    candidates.forEach((candidate: Candidate) => {
      const misis = [];
      const pengalamans = [];

      candidate.misi.forEach((misi: Misi) => {
        misis.push(misi.misi);
      });

      candidate.pengalaman.forEach((pengalaman: Pengalaman) => {
        pengalamans.push(pengalaman.pengalaman);
      });

      const candidateDto: CandidateDto = {
        id: candidate.id,
        name: candidate.name,
        misi: misis,
        pengalaman: pengalamans,
      };

      candidatesDto.push(candidateDto);
    });

    return {
      message: 'Success',
      data: candidatesDto,
    };
  }
}
