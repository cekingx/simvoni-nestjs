export class UserDto {
    id              : number;
    name            : string;
    username        : string;
    password?       : string;
    walletAddress   : string;
    privateKey      : string;
    role            : string;
}