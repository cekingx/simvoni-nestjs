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
    private authService: AuthService,
    private userService: UsersService,
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
  async registerNewUser(@Body() createUserDto: CreateUserDto)
  {
    const { password, walletAddress, privateKey, ...rest } = await this.userService.create(createUserDto);

    return {
      message: 'Success',
      data: rest
    }
  }

  @Get('new-account')
  async newAccount() {
    const result = this.walletService.newAccount();

    return {
      message: 'Success',
      data: result,
    };
  }
}
