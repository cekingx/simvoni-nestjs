export class WeightDto {
  name: string;
  weight: number;
}

export class ElectionWeightDto {
  electionId: number;
  electionName: string;
  weight: WeightDto[];
}
