/* eslint-disable prettier/prettier */
import {
  Controller,
  Request,
  Get,
  Post,
  UseGuards,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { EthereumElectionService } from './ethereum/election/ethereum-election.service';
import { WalletService } from './ethereum/wallet/wallet.service';
import { CreateUserDto } from './users/create-user.dto';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private userService: UsersService,
    private electionService: EthereumElectionService,
    private walletService: WalletService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() res)
  {
    const data = await this.authService.generateToken(req.user);

    res.status(HttpStatus.OK).json({
      message: "Success",
      data: data
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('register')
  registerNewUser(@Body() createUserDto: CreateUserDto)
  {
    return this.userService.create(createUserDto);
  }

  @Get('get-account')
  getAccount()
  {
    return this.electionService.getAccounts();
  }

  @Post('send-ether')
  sendEther()
  {
    // begin::register-candidate
    const contractMethods = this.walletService.getContractMethods(
      '0x6cd26E299450d6278C808CbA96f8488E840D9685', 
      'REGISTER_CANDIDATE', 
      'i-dewa-gede-dirga-yasa'
    );

    return this.walletService.sendEtherForMethods(
      contractMethods, 
      '0x5219eFd1C36fb5cf82b51d953b3CBa5F0a47d234', 
      '0xA47626D97a4c2829c903514b2aEa3D3648219104', 
      'password'
    );
    // end::register-candidate

    // begin::vote
    // const contractMethods = this.walletService.getContractMethods(
    //   '0x6cd26E299450d6278C808CbA96f8488E840D9685', 
    //   'VOTE', 
    //   'i-dewa-gede-dirga-yasa'
    // );

    // return this.walletService.sendEtherForMethods(
    //   contractMethods, 
    //   '0x5219eFd1C36fb5cf82b51d953b3CBa5F0a47d234', 
    //   '0xA47626D97a4c2829c903514b2aEa3D3648219104', 
    //   'password'
    // );
    // end::vote

    // begin::start-election
    // end::start-election

    // begin::end-election
    // end::end-election
  }
}
