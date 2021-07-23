import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AccountService {
  constructor(@Inject('web3') private web3: any) {}

  unlockAccount(address: string, password: string): Promise<any> {
    return this.web3.eth.personal.unlockAccount(address, password, null);
  }
}
