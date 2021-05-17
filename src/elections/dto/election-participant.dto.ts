export class ParticipationDto {
  participationId: number;
  electionId: number;
  election: string;
  status: string;
}

export class ParticipantDto {
  participationId: number;
  userId: number;
  username: string;
  status: string;
}

export class ElectionParticipantDto {
  electionId: number;
  electionName: string;
  participant: ParticipantDto[];
}

export class UserParticipationDto {
  userId: number;
  username: string;
  participation: ParticipationDto[];
}
