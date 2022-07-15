import { CandidateDto } from './candidate.dto';
import { ElectionDto } from './election.dto';

export class ElectionDetailDto extends ElectionDto {
  participation_status?: string;
  from?: string;
  to?: string;
  candidates: CandidateDto[];
}
