import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ElectionService } from '../../elections/election/election.service';

@Controller('voter')
export class VoterController {
  constructor(private electionService: ElectionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('election-participation')
  async getElectionParticipation(@Request() req) {
    const username: string = req.user.username;
    const participation = await this.electionService.getUserParticipation(
      username,
    );

    return participation;
  }
}
