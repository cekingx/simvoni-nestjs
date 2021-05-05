import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../users/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      const result: UserDto = {
        id: user.id,
        name: user.name,
        username: user.username,
        walletAddress: user.walletAddress,
        privateKey: user.privateKey,
        role: user.userRole.role,
      };
      return result;
    }
    return null;
  }

  async generateToken(user: UserDto) {
    const payload = { username: user.username, role: user.role };
    return {
      username: user.username,
      name: user.name,
      role: user.role,
      token: this.jwtService.sign(payload),
    };
  }
}
