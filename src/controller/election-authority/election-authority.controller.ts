import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ElectionService } from 'src/ethereum/election/election.service';

@Controller('election-authority')
export class ElectionAuthorityController {
    constructor(
        private electionService: ElectionService,
    )
    {}

    @UseGuards(JwtAuthGuard)
    @Get('election')
    getElectionByUserId(@Request() req)
    {
        return req.user;
    }
}
