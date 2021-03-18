import { Controller,Request, Get, Post, UseGuards, Body, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from "./auth/local-auth.guard";
import { CreateUserDto } from './users/create-user.dto';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private userService: UsersService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

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
}
