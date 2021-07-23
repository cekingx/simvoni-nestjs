import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AddCandidateDto } from '../../elections/dto/add-candidate.dto';
import { CreateElectionDto } from '../../elections/dto/create-election.dto';
import { ElectionDto } from '../../elections/dto/election.dto';
import { ElectionService } from '../../elections/election/election.service';
import { Election } from '../../elections/entity/election.entity';
import { CandidateDto } from '../../elections/dto/candidate.dto';
import { Candidate } from '../../elections/entity/candidate.entity';
import { Misi } from '../../elections/entity/misi.entity';
import { Pengalaman } from '../../elections/entity/pengalaman.entity';
import {
  ElectionParticipantDto,
  ParticipantDto,
} from '../../elections/dto/election-participant.dto';
import { ElectionParticipant } from '../../elections/entity/election-participant.entity';
import { WalletService } from '../../ethereum/wallet/wallet.service';
import { EthereumElectionService } from '../../ethereum/election/ethereum-election.service';
import { UsersService } from '../../users/users.service';

@Controller('election-authority')
export class ElectionAuthorityController {
  constructor(
    private electionService: ElectionService,
    private ethereumElectionService: EthereumElectionService,
    private walletService: WalletService,
    private userService: UsersService,
  ) {}

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
  @Get('election/:electionId')
  async getElectionById(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);
    const electionDto: ElectionDto = {
      id: election.id,
      name: election.name,
      description: election.description,
      start: election.start,
      end: election.end,
      status: election.status.status,
      ea: election.electionAuthority.username,
    };

    return {
      message: 'Success',
      data: electionDto,
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

    const electionDto: ElectionDto = {
      id: election.id,
      name: election.name,
      description: election.description,
      start: election.start,
      end: election.end,
      status: election.status.status,
      ea: election.electionAuthority.username,
    };

    return {
      message: 'Success',
      data: electionDto,
    };
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
        visi: candidate.visi,
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

  @UseGuards(JwtAuthGuard)
  @Get('election-participant/:electionId')
  async getElectionParticipantByElectionId(
    @Param('electionId') electionId: number,
  ) {
    const participants = await this.electionService.getElectionParticipant(
      electionId,
    );
    const election = await this.electionService.getElectionById(electionId);

    const participantsDto: ParticipantDto[] = [];

    participants.forEach((participant: ElectionParticipant) => {
      const participantDto: ParticipantDto = {
        participationId: participant.id,
        userId: participant.participant.id,
        username: participant.participant.username,
        status: participant.status.status,
      };

      participantsDto.push(participantDto);
    });

    const electionParticipantDto: ElectionParticipantDto = {
      electionId: election.id,
      electionName: election.name,
      participant: participantsDto,
    };

    return {
      message: 'Success',
      data: electionParticipantDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('election-participant/accept/:participationId')
  async acceptParticipation(@Param('participationId') participationId: number) {
    const electionParticipation = await this.electionService.getElectionParticipationById(
      participationId,
    );
    this.electionService.acceptParticipation(electionParticipation);

    return {
      message: 'Success',
      data: electionParticipation,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('election-participant/reject/:participationId')
  async rejectParticipation(@Param('participationId') participationId: number) {
    const electionParticipation = await this.electionService.getElectionParticipationById(
      participationId,
    );
    this.electionService.rejectParticipation(electionParticipation);

    return {
      message: 'Success',
      data: electionParticipation,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('start-election/:electionId')
  async startElection(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);
    const superAdmin = await this.userService.findOne('super-admin');
    const ea = await this.userService.findElectionAuthorityById(
      election.electionAuthority.id,
    );

    const contractMethods = this.walletService.getContractMethods(
      election.contractAddress,
      'START_ELECTION',
    );

    // await this.walletService.sendEtherForMethods(
    //   contractMethods,
    //   ea.walletAddress,
    //   superAdmin.walletAddress,
    //   process.env.ETH_PASSWORD,
    // );

    const contract = this.ethereumElectionService.connectToContract(
      election.contractAddress,
    );

    const receipt = await this.ethereumElectionService.startElection(
      contract,
      ea.walletAddress,
    );

    await this.electionService.updateElectionStatus(election, 4);

    return {
      message: 'Success',
      data: receipt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('end-election/:electionId')
  async endElection(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);
    const superAdmin = await this.userService.findOne('super-admin');
    const ea = await this.userService.findElectionAuthorityById(
      election.electionAuthority.id,
    );
    const contractMethods = this.walletService.getContractMethods(
      election.contractAddress,
      'END_ELECTION',
    );

    await this.walletService.sendEtherForMethods(
      contractMethods,
      ea.walletAddress,
      superAdmin.walletAddress,
      process.env.ETH_PASSWORD,
    );

    const contract = this.ethereumElectionService.connectToContract(
      election.contractAddress,
    );

    const receipt = await this.ethereumElectionService.endElection(
      contract,
      ea.walletAddress,
    );

    await this.electionService.updateElectionStatus(election, 5);

    return {
      message: 'Success',
      data: receipt,
    };
  }
}
