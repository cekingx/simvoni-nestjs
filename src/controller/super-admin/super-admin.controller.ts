import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ErrorResponseService } from 'src/helper/error-response/error-response.service';
import { CreateEaDto } from 'src/users/create-ea.dto';
import { UserDto } from 'src/users/user.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Controller('super-admin')
export class SuperAdminController {
  constructor(
    private userService: UsersService,
    private errorResponseService: ErrorResponseService,
  ) {}

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
}
