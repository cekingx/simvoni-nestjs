import { Controller, Get } from '@nestjs/common';
import { UserDto } from 'src/users/user.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Controller('super-admin')
export class SuperAdminController {
    constructor(
        private userService: UsersService
    ) {}

    @Get('election-authority')
    async getAllElectionAuthority()
    {
        let users: UserDto[]    = [];
        let electionAuthority   = await this.userService.findAllElectionAuthority();

        electionAuthority.forEach((user: User) => {
            let userDto: UserDto = {
                id              : user.id,
                name            : user.name,
                username        : user.username,
                walletAddress   : user.walletAddress,
                privateKey      : user.privateKey,
                role            : user.userRole.role
            };

            users.push(userDto);
        });

        return {
            message: "Success",
            data: users
        }
    }
}
