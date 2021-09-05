export class UserDto {
  id: number;
  name: string;
  username: string;
  password?: string;
  walletAddress: string;
  randomSeed: string;
  role: string;
}
