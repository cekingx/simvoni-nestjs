import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddCandidateDto } from 'src/elections/dto/add-candidate.dto';
import { CreateElectionDto } from 'src/elections/dto/create-election.dto';
import { ElectionService } from 'src/elections/election/election.service';

@Controller('election-authority')
export class ElectionAuthorityController {
  constructor(private electionService: ElectionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('elections')
  async getElectionByUsername(@Request() req) {
    const elections = await this.electionService.getElectionByUsername(
      req.user.username,
    );

    return elections;
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
}
