import { Controller,Request, Get, Post, UseGuards, Body, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from "./auth/local-auth.guard";
import { ElectionService } from './ethereum/election/election.service';
import { CreateUserDto } from './users/create-user.dto';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private userService: UsersService,
    private electionService: ElectionService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() res)
  {
    let data = await this.authService.generateToken(req.user);

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

  @Post('deploy-contract')
  deployContract()
  {
    return this.electionService.deployContract('0x62700b14ECc5Ff12A411B69Fd604F54A5a7A3e4F');
  }
}
