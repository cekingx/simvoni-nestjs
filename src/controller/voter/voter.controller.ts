import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ParticipationDto,
  UserParticipationDto,
} from 'src/elections/dto/election-participant.dto';
import { ElectionParticipant } from 'src/elections/entity/election-participant.entity';
import { UsersService } from '../../users/users.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ElectionService } from '../../elections/election/election.service';
import { Ballot } from '../../elections/dto/ballot.dto';
import { EthereumElectionService } from '../../ethereum/election/ethereum-election.service';
import { WalletService } from '../../ethereum/wallet/wallet.service';
import { Election } from 'src/elections/entity/election.entity';
import { ElectionDto } from 'src/elections/dto/election.dto';
import { FollowedElectionDto } from 'src/elections/dto/followed-election.dto';

@Controller('voter')
export class VoterController {
  constructor(
    private electionService: ElectionService,
    private ethereumElectionService: EthereumElectionService,
    private walletService: WalletService,
    private userService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('election-participation')
  async getElectionParticipation(@Request() req) {
    const username: string = req.user.username;
    const participationsDto: ParticipationDto[] = [];
    const participations = await this.electionService.getUserParticipation(
      username,
    );
    const user = await this.userService.findOne(username);

    participations.forEach((participation: ElectionParticipant) => {
      const participationDto: ParticipationDto = {
        participationId: participation.id,
        electionId: participation.election.id,
        election: participation.election.name,
        status: participation.status.status,
      };

      participationsDto.push(participationDto);
    });

    const userParticipationDto: UserParticipationDto = {
      userId: user.id,
      username: user.username,
      participation: participationsDto,
    };

    return {
      message: 'Success',
      data: userParticipationDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('vote')
  async voteOnElection(@Request() req, @Body() ballot: Ballot) {
    try {
      const username = req.user.username;
      const voter = await this.userService.findOne(username);
      const superAdmin = await this.userService.findOne('super-admin');
      const election = await this.electionService.getElectionById(
        ballot.election_id,
      );
      const candidate = await this.electionService.getCandidateById(
        ballot.candidate_id,
      );
      const contractMethods = this.walletService.getContractMethods(
        election.contractAddress,
        'VOTE',
        candidate.nameSlug,
      );

      await this.walletService.sendEtherForMethods(
        contractMethods,
        voter.walletAddress,
        superAdmin.walletAddress,
        process.env.ETH_PASSWORD,
      );

      const contract = this.ethereumElectionService.connectToContract(
        election.contractAddress,
      );
      const receipt = this.ethereumElectionService.vote(
        contract,
        candidate.nameSlug,
        voter.walletAddress,
      );

      return receipt;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('available-election')
  async getAvailableElection(@Request() req) {
    const availableElectionDto: ElectionDto[] = [];
    const username: string = req.user.username;
    const availableElection: Election[] = await this.electionService.getAvailableElection(
      username,
    );

    availableElection.forEach((election: Election) => {
      const electionDto: ElectionDto = {
        id: election.id,
        name: election.name,
        description: election.description,
        start: election.start,
        end: election.end,
        status: election.status.status,
        ea: election.electionAuthority.name,
      };
      availableElectionDto.push(electionDto);
    });

    return {
      message: 'Success',
      data: availableElectionDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('followed-election')
  async getFollowedElection(@Request() req) {
    const followedElectionDto: FollowedElectionDto[] = [];
    const username: string = req.user.username;
    const followedElection: Election[] = await this.electionService.getFollowedElection(
      username,
    );
    const participations: ElectionParticipant[] = await this.electionService.getUserParticipation(
      username,
    );

    followedElection.forEach((election: Election) => {
      const participation = participations.find(
        (data: ElectionParticipant) => data.election.id == election.id,
      );

      const electionDto: FollowedElectionDto = {
        id: election.id,
        name: election.name,
        description: election.description,
        start: election.start,
        end: election.end,
        status: election.status.status,
        participation_status: participation.status.status,
        ea: election.electionAuthority.name,
      };

      followedElectionDto.push(electionDto);
    });

    return {
      message: 'Success',
      data: followedElectionDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('ended-election')
  async getEndedElection(@Request() req) {
    const endedElection: Election[] = await this.electionService.getEndedElection();
    const endedElectionDto: ElectionDto[] = [];

    endedElection.forEach((election: Election) => {
      const electionDto: ElectionDto = {
        id: election.id,
        name: election.name,
        description: election.description,
        start: election.start,
        end: election.end,
        status: election.status.status,
        ea: election.electionAuthority.name,
      };
      endedElectionDto.push(electionDto);
    });

    return {
      message: 'Oke',
      data: endedElectionDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('join/:electionId')
  async joinAnElection(@Request() req, @Param('electionId') electionId) {
    const username: string = req.user.username;
    const participation: ElectionParticipant = await this.electionService.addElectionParticipation(
      username,
      electionId,
    );
    const election: Election = await this.electionService.getElectionById(
      electionId,
    );
    const electionDto: ElectionDto = {
      id: election.id,
      name: election.name,
      description: election.description,
      start: election.start,
      end: election.end,
      status: election.status.status,
      ea: election.electionAuthority.name,
    };

    return {
      message: 'Success',
      data: electionDto,
    };
  }
}
