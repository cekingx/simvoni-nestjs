import { CandidateDto } from './candidate.dto';
import { ElectionDto } from './election.dto';

export class EndedCandidateDto extends CandidateDto {
  vote_count: number;
}

export class EndedElectionDto extends ElectionDto {
  winner: string;
  votes: number;
  abstains: number;
  total: number;
  candidates: EndedCandidateDto[];
}
