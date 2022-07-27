import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
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
import { ElectionDetailDto } from '../../elections/dto/election-detail.dto';
import { ElectionStatusEnum } from '../../helper/status';
import { AddWeightDto } from 'src/elections/dto/add-weight.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ElectionWeightDto,
  WeightDto,
} from 'src/elections/dto/election-weight.dto';

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
        image: candidate.image,
        misi: misis,
        pengalaman: pengalamans,
      };

      candidatesDto.push(candidateDto);
    });
    const electionDto: ElectionDetailDto = {
      id: election.id,
      name: election.name,
      description: election.description,
      start: election.start,
      end: election.end,
      status: election.status.status,
      ea: election.electionAuthority.username,
      candidates: candidatesDto,
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
      message: 'Sukses Membuat Pemilihan',
      data: electionDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-candidate/:electionId')
  @UseInterceptors(FileInterceptor('file'))
  async addCandidateToElection(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Param('electionId') electionId: number,
    @Request() req,
  ) {
    const isValidEa = this.electionService.validateEa(
      req.user.username,
      electionId,
    );

    const { data } = Object.assign({}, body);
    const addCandidateDto: AddCandidateDto = JSON.parse(data);

    if (isValidEa) {
      const candidate = await this.electionService.addCandidate(
        addCandidateDto,
        electionId,
        file,
      );
      return {
        message: 'Sukses Menambahkan Kandidat',
        data: candidate,
      };
    }

    return false;
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-weight/:electionId')
  async addWeightToElection(
    @Body() addWeightDto: AddWeightDto,
    @Param('electionId') electionId: number,
    @Request() req,
  ) {
    const isValidEa = this.electionService.validateEa(
      req.user.username,
      electionId,
    );

    if (isValidEa) {
      const weight = await this.electionService.addWeight(
        addWeightDto,
        electionId,
      );
      return {
        message: 'Sukses Menambahkan Weight',
        data: weight,
      };
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
        image: candidate.image,
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
  @Post('election/:electionId/ready')
  async setReadyToDeploy(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);
    await this.electionService.updateElectionStatus(
      election,
      ElectionStatusEnum.readyToDeploy,
    );

    return {
      message: 'Success',
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
      message: 'Sukses',
      data: electionParticipantDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('election-participant/accept/:participationId')
  async acceptParticipation(
    @Param('participationId') participationId: number,
    @Body() body: any,
  ) {
    const electionParticipation = await this.electionService.getElectionParticipationById(
      participationId,
    );
    await this.electionService.acceptParticipation(
      electionParticipation,
      body.weightId,
    );

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
    await this.electionService.rejectParticipation(electionParticipation);

    return {
      message: 'Success',
      data: electionParticipation,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('weight/:electionId')
  async getElectionWeightByElectionId(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);
    const weightsDto: WeightDto[] = await this.electionService.getWeightByElectionId(
      electionId,
    );

    const electionWeightDto: ElectionWeightDto = {
      electionId: election.id,
      electionName: election.name,
      weight: weightsDto,
    };

    return {
      message: 'Sukses',
      data: electionWeightDto,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('start-election/:electionId')
  async startElection(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);
    console.log(election);

    await this.ethereumElectionService.start(
      election.contractAddress,
      election.electionAuthority.privateKey,
    );

    await this.electionService.updateElectionStatus(election, 4);

    return {
      message: 'Sukses Memulai Pemilihan',
      data: {
        election: election.name,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('end-election/:electionId')
  async endElection(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);

    await this.ethereumElectionService.end(
      election.contractAddress,
      election.electionAuthority.privateKey,
    );
    await this.electionService.updateElectionStatus(election, 5);

    return {
      message: 'Sukses Menghentikan Pemilihan',
      data: {
        election: election.name,
      },
    };
  }
}
