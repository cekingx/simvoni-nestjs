import { CandidateDto } from './candidate.dto';
import { ElectionDto } from './election.dto';

export class ElectionDetailDto extends ElectionDto {
  candidates: CandidateDto[];
}
