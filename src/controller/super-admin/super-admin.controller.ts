import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ElectionService } from '../../elections/election/election.service';
import { WalletService } from '../../ethereum/wallet/wallet.service';
import { ErrorResponseService } from '../../helper/error-response/error-response.service';
import { CreateEaDto } from '../../users/create-ea.dto';
import { UserDto } from '../../users/user.dto';
import { User } from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { EthereumElectionService } from '../../ethereum/election/ethereum-election.service';
import { Election } from '../../elections/entity/election.entity';
import { ElectionDto } from '../../elections/dto/election.dto';

@Controller('super-admin')
export class SuperAdminController {
  constructor(
    private userService: UsersService,
    private errorResponseService: ErrorResponseService,
    private walletService: WalletService,
    private electionService: ElectionService,
    private ethereumElectionService: EthereumElectionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('election-authority')
  async getAllElectionAuthority() {
    const users: UserDto[] = [];
    const electionAuthority = await this.userService.findAllElectionAuthority();

    electionAuthority.forEach((user: User) => {
      const userDto: UserDto = {
        id: user.id,
        name: user.name,
        username: user.username,
        walletAddress: user.walletAddress,
        privateKey: user.privateKey,
        role: user.userRole.role,
      };

      users.push(userDto);
    });

    return {
      message: 'Success',
      data: users,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('election-authority/:userId')
  async getElectionAuthorityById(@Param('userId') userId: number, @Res() res) {
    try {
      const electionAuthority = await this.userService.findElectionAuthorityById(
        userId,
      );

      const user: UserDto = {
        id: electionAuthority.id,
        name: electionAuthority.name,
        username: electionAuthority.username,
        walletAddress: electionAuthority.walletAddress,
        privateKey: electionAuthority.privateKey,
        role: electionAuthority.userRole.role,
      };

      const response = {
        message: 'Success',
        data: user,
      };
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(this.errorResponseService.notFound());
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('election-authority')
  async createElectionAuthority(@Body() createEaDto: CreateEaDto, @Res() res) {
    try {
      const ea = await this.userService.createEa(createEaDto);
      const eaDto: UserDto = {
        id: ea.id,
        name: ea.name,
        username: ea.username,
        walletAddress: ea.walletAddress,
        privateKey: ea.privateKey,
        role: ea.userRole.role,
      };

      return res.status(HttpStatus.OK).json({
        message: 'Success',
        data: eaDto,
      });
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(this.errorResponseService.errorResponse(error.code));
      return;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('election-authority/set-wallet-address/:userId')
  async setEaWalletAddress(@Param('userId') userId: number, @Res() res) {
    try {
      const user: User = await this.userService.findElectionAuthorityById(
        userId,
      );

      let address = user.walletAddress;

      if (user.walletAddress == null && user.privateKey == null) {
        const data = await this.walletService.createAccount('defaultpass');

        user.walletAddress = data.address;
        user.privateKey = data.privateKey;

        address = data.address;
        await this.userService.updateUser(user);
      }

      return res.status(HttpStatus.OK).json({
        message: 'Success',
        data: {
          address,
        },
      });
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(this.errorResponseService.badRequest());
      return;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('election/ready-to-deploy')
  async getReadyToDeployElection() {
    const elections: Election[] = await this.electionService.getReadyToDeployElection();
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

  /**
   * TODO:
   * 1. Validation contract address is null
   */
  @UseGuards(JwtAuthGuard)
  @Post('deploy-election/:electionId')
  async deployElection(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);
    const candidatesSlug = await this.electionService.getCandidatesSlugByElectionId(
      electionId,
    );
    const superAdmin = await this.userService.findOne('super-admin');
    const ea = await this.userService.findElectionAuthorityById(
      election.electionAuthority.id,
    );

    await this.walletService.sendEtherForDeploy(
      superAdmin.walletAddress,
      process.env.ETH_PASSWORD,
      ea.walletAddress,
    );

    const contractAddress = await this.ethereumElectionService.deployContract(
      ea.walletAddress,
      process.env.ETH_PASSWORD,
    );

    election.contractAddress = contractAddress;
    await this.electionService.updateElectionAddress(election, contractAddress);
    await this.electionService.updateElectionStatus(election, 3);

    const contract = await this.ethereumElectionService.connectToContract(
      contractAddress,
    );

    for (let index = 0; index < candidatesSlug.length; index++) {
      const candidate = candidatesSlug[index];

      const contractMethods = this.walletService.getContractMethods(
        contractAddress,
        'REGISTER_CANDIDATE',
        candidate.nameSlug,
      );
      await this.walletService.sendEtherForMethods(
        contractMethods,
        ea.walletAddress,
        superAdmin.walletAddress,
        process.env.ETH_PASSWORD,
      );
      const receipt = await this.ethereumElectionService.registerCandidate(
        contract,
        candidate.nameSlug,
        ea.walletAddress,
        process.env.ETH_PASSWORD,
      );
      console.log('[Candidate] ' + receipt);
    }

    return {
      message: 'Success',
      data: {
        address: contractAddress,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('num-candidates/:address')
  async getNumCandidates(@Param('address') address: string) {
    const contract = this.ethereumElectionService.connectToContract(address);
    const numCandidate = await this.ethereumElectionService.getNumCandidates(
      contract,
    );

    return {
      message: 'Success',
      data: numCandidate,
    };
  }
}
