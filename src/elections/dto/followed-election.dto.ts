import { ElectionDto } from './election.dto';

export class FollowedElectionDto extends ElectionDto {
  participation_status: string;
}
