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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ElectionService } from 'src/elections/election/election.service';
import { WalletService } from 'src/ethereum/wallet/wallet.service';
import { ErrorResponseService } from 'src/helper/error-response/error-response.service';
import { CreateEaDto } from 'src/users/create-ea.dto';
import { UserDto } from 'src/users/user.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { EthereumElectionService } from 'src/ethereum/election/ethereum-election.service';

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

      res.status(HttpStatus.OK).json({
        message: 'Success',
        data: user,
      });

      return;
    } catch (error) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json(this.errorResponseService.notFound());
      return;
    }
  }

  @Post('election-authority')
  async createElectionAuthority(@Body() createEaDto: CreateEaDto, @Res() res) {
    try {
      await this.userService.createEa(createEaDto);

      res.status(HttpStatus.OK).json({
        message: 'Success',
      });

      return;
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(this.errorResponseService.errorResponse(error.code));
      return;
    }
  }

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

      setTimeout(() => {
        res.status(HttpStatus.OK).json({
          message: 'Success',
          data: {
            address,
          },
        });
      }, 5000);

      return;
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json(this.errorResponseService.badRequest());
      return;
    }
  }

  /**
   * WIP:
   * 1. Get super-admin address [v]
   * 2. Get election-authority address [v]
   * 3. Send 0.011 eth from super-admin to election-authority [v]
   * 4. Deploy contract with election-authority address [v]
   * 5. Save contract address to database [v]
   * 6. Set candidates to contract
   *
   * TODO:
   * 1. Validation contract address is null
   */
  @UseGuards(JwtAuthGuard)
  @Post('deploy-election/:electionId')
  async deployElection(@Param('electionId') electionId: number) {
    const election = await this.electionService.getElectionById(electionId);
    const superAdmin = await this.userService.findOne('super-admin');
    const ea = await this.userService.findElectionAuthorityById(
      election.electionAuthority.id,
    );

    await this.walletService.sendEther(
      superAdmin.walletAddress,
      'password',
      ea.walletAddress,
      '11000000000000000',
    );

    const contractAddress = await this.ethereumElectionService.deployContract(
      ea.walletAddress,
    );

    election.contractAddress = contractAddress;
    this.electionService.updateElection(election);

    return {
      address: contractAddress,
    };
  }
}
