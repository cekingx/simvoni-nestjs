import {
  Body,
  Controller,
  Get,
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
        'password',
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
}
