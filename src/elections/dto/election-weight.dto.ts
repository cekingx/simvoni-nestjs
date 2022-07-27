export class WeightDto {
  id: number;
  name: string;
  weight: number;
}

export class ElectionWeightDto {
  electionId: number;
  electionName: string;
  weight: WeightDto[];
}
