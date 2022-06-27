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
import { Election } from '../../elections/entity/election.entity';
import { ElectionDto } from '../../elections/dto/election.dto';
import { FollowedElectionDto } from '../../elections/dto/followed-election.dto';
import { Candidate } from '../../elections/entity/candidate.entity';
import { CandidateDto } from '../../elections/dto/candidate.dto';
import { ElectionDetailDto } from '../../elections/dto/election-detail.dto';
import { Misi } from '../../elections/entity/misi.entity';
import { Pengalaman } from '../../elections/entity/pengalaman.entity';
import { User } from '../../users/user.entity';
import {
  EndedCandidateDto,
  EndedElectionDto,
} from '../../elections/dto/ended-election.dto';
import { ParticipationEnum } from '../../helper/status';

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
      message: 'Sukses',
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
      const voterParticipations: ElectionParticipant[] = await this.electionService.getUserParticipation(
        username,
      );
      const voterParticipation = voterParticipations.find(
        (data: ElectionParticipant) => data.election.id == ballot.election_id,
      );
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

      /**
       * delete soon
       */
      // await this.walletService.sendEtherForMethods(
      //   contractMethods,
      //   voter.walletAddress,
      //   superAdmin.walletAddress,
      //   process.env.ETH_PASSWORD,
      // );

      const contract = this.ethereumElectionService.connectToContract(
        election.contractAddress,
      );

      const receipt = this.ethereumElectionService.vote(
        contract,
        candidate.nameSlug,
        voter.walletAddress,
        process.env.ETH_PASSWORD,
      );

      await this.electionService.updateParticipationStatus(
        voterParticipation.id,
        ParticipationEnum.voted,
      );

      return {
        message: 'Sukses Memberikan Suara',
        data: {
          election: election.name,
        },
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('vote/:id/abstain')
  async voteAbstain(@Request() req: any, @Param('id') electionId: number) {
    try {
      const username = req.user.username;
      const voter = await this.userService.findOne(username);
      const voterParticipations: ElectionParticipant[] = await this.electionService.getUserParticipation(
        username,
      );
      const voterParticipation = voterParticipations.find(
        (data: ElectionParticipant) => data.election.id == electionId,
      );
      const election = await this.electionService.getElectionById(electionId);

      await this.ethereumElectionService.abstain(
        election.contractAddress,
        voter.privateKey,
      );

      await this.electionService.updateParticipationStatus(
        voterParticipation.id,
        ParticipationEnum.voted,
      );

      return {
        message: 'Sukses Memberikan Suara Abstain',
        data: {
          election: election.name,
        },
      };
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
      message: 'Sukses',
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
      message: 'Sukses',
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
      message: 'Sukses',
      data: endedElectionDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('election-detail/:electionId')
  async getElectionDetail(@Request() req, @Param('electionId') electionId) {
    const username = req.user.username;
    const userParticipations: ElectionParticipant[] = await this.electionService.getUserParticipation(
      username,
    );
    const election: Election = await this.electionService.getElectionById(
      electionId,
    );
    const candidates: Candidate[] = await this.electionService.getCandidatesByElectionId(
      electionId,
    );
    const candidatesDto: CandidateDto[] = [];

    candidates.forEach((candidate: Candidate) => {
      const misis: string[] = [];
      const pengalamans: string[] = [];

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

    const userParticipation = userParticipations.find(
      (data: ElectionParticipant) => data.election.id == election.id,
    );

    const electionDto: ElectionDetailDto = {
      id: election.id,
      name: election.name,
      description: election.description,
      start: election.start,
      end: election.end,
      status: election.status.status,
      ea: election.electionAuthority.name,
      participation_status: userParticipation.status.status,
      candidates: candidatesDto,
    };

    return {
      message: 'Sukses',
      data: electionDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('ended-election-detail/:electionId')
  async getEndedElectionDetail(
    @Request() req,
    @Param('electionId') electionId,
  ) {
    const election: Election = await this.electionService.getElectionById(
      electionId,
    );
    const candidates: Candidate[] = await this.electionService.getCandidatesByElectionId(
      electionId,
    );
    const endedCandidateDto: EndedCandidateDto[] = [];
    const contract = this.ethereumElectionService.connectToContract(
      election.contractAddress,
    );

    for (let index = 0; index < candidates.length; index++) {
      const candidate = candidates[index];

      const misis: string[] = [];
      const pengalamans: string[] = [];

      const voteCount: any = await this.ethereumElectionService.getVoteCount(
        contract,
        index,
      );

      candidate.misi.forEach((misi: Misi) => {
        misis.push(misi.misi);
      });

      candidate.pengalaman.forEach((pengalaman: Pengalaman) => {
        pengalamans.push(pengalaman.pengalaman);
      });

      const candidateDto: EndedCandidateDto = {
        id: candidate.id,
        name: candidate.name,
        visi: candidate.visi,
        vote_count: +voteCount._votes,
        misi: misis,
        pengalaman: pengalamans,
      };

      endedCandidateDto.push(candidateDto);
    }

    const winner = endedCandidateDto.reduce((prev, current) => {
      return prev.vote_count > current.vote_count ? prev : current;
    });

    const endedElectionDto: EndedElectionDto = {
      id: election.id,
      name: election.name,
      description: election.description,
      start: election.start,
      end: election.end,
      status: election.status.status,
      ea: election.electionAuthority.name,
      winner: winner.name,
      candidates: endedCandidateDto,
    };

    return {
      message: 'Sukses',
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
      message: 'Sukses Mengikuti Pemilihan',
      data: electionDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade-role')
  async upgradeRole(@Request() req) {
    const username = req.user.username;

    await this.userService.requestUpgradeRole(username);

    return {
      message: 'Permintaan Sedang Diproses',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('upgrade-role/status')
  async upgradeRoleStatus(@Request() req) {
    const username = req.user.username;

    const { code, value } = await this.userService.upgradeRoleStatus(username);

    return {
      data: {
        code,
        value,
      },
    };
  }
}
