import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';

@Injectable()
export class WalletService {
    constructor(@Inject('web3') private web3: Web3)
    { }

    async createAccount(password: string): Promise<any>
    {
        let account = this.web3.eth.accounts.create();

        await this.web3.eth.personal.importRawKey(account.privateKey, password);
        return account;
    }

    unlockAccount(address: string, password: string): Promise<any>
    {
        return this.web3.eth.personal.unlockAccount(address, password, 600);
    }

    sendEther(
        sender          : string,
        senderPassword  : string,
        receiver        : string,
        amount          : string
    ): Promise<any>
    {
        return this.web3.eth.personal.sendTransaction({
            from        : sender,
            gasPrice    : '20000000000',
            gas         : '21000',
            to          : receiver,
            value       : amount,
            data        : ''
        }, senderPassword);
    }
}
