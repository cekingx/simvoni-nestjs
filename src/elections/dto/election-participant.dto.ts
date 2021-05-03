export class ParticipationDto {
  participationId: number;
  userId: number;
  username: string;
  electionId: number;
  election: string;
  status: string;
}

export class ElectionParticipantDto {
  electionId: number;
  electionName: string;
  participant: ParticipationDto[];
}

export class UserParticipationDto {
  userId: number;
  username: string;
  participation: ParticipationDto[];
}
