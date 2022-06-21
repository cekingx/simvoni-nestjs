import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { Wallet, ethers, utils } from 'ethers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Web3 from 'web3';
import { AccountService } from '../account/account.service';
import { EthereumElectionService } from '../election/ethereum-election.service';

@Injectable()
export class WalletService {
  constructor(
    @Inject('web3') private web3: any,
    private ethereumElectionService: EthereumElectionService,
    private accountService: AccountService,
    private http: HttpService,
  ) {}

  newAccount(): Wallet {
    const result = Wallet.createRandom();
    console.log(result.privateKey);
    return result;
  }

  createAccount(password: string): Observable<any> {
    return this.http
      .post(process.env.ETH_ENDPOINT, {
        jsonrpc: '2.0',
        method: 'parity_newAccountFromPhrase',
        params: [password, process.env.ETH_PASSWORD],
        id: 0,
      })
      .pipe(map((response) => response.data));
  }

  /**
   * @deprecated
   * delete soon
   */
  async sendEther(
    sender: string,
    senderPassword: string,
    receiver: string,
    amount: string,
  ): Promise<any> {
    this.accountService.unlockAccount(sender, senderPassword);
    const gasPrice = await this.web3.eth.getGasPrice();

    return this.web3.eth.sendTransaction({
      from: sender,
      gasPrice: gasPrice,
      gas: 21000,
      to: receiver,
      value: amount,
    });
  }

  async sendEtherFromFaucet(destination: string, amount: string) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const faucet = new Wallet(process.env.FAUCET_PRIVATE_KEY);
    const result = await faucet.connect(provider).sendTransaction({
      to: destination,
      value: utils.parseEther(amount),
    });

    return result;
  }

  /**
   * @deprecated
   */
  async sendEtherForDeploy(
    sender: string,
    senderPassword: string,
    receiver: string,
  ): Promise<any> {
    this.accountService.unlockAccount(sender, senderPassword);
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasPriceBN = new BigNumber(gasPrice);
    const gasAmount = process.env.ETH_CONTRACT_GAS;
    const gas = gasPriceBN.times(gasAmount).toString();

    return this.web3.eth.sendTransaction({
      from: sender,
      gasPrice: gasPrice,
      gas: 21000,
      to: receiver,
      value: this.web3.utils.toHex(gas),
    });
  }

  getContractMethods(contractAddress: string, method: string, param?: string) {
    const contract: any = this.ethereumElectionService.connectToContract(
      contractAddress,
    );

    if (method == 'REGISTER_CANDIDATE') {
      return contract.methods.register_candidate(param);
    }

    if (method == 'VOTE') {
      return contract.methods.vote(param);
    }

    if (method == 'START_ELECTION') {
      return contract.methods.start_election();
    }

    if (method == 'END_ELECTION') {
      return contract.methods.end_election();
    }
  }

  async sendEtherForMethods(
    contractMethods: any,
    receiver: string,
    sender: string,
    senderPassword: string,
  ): Promise<any> {
    this.accountService.unlockAccount(sender, senderPassword);
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasPriceBN = new BigNumber(gasPrice);
    const gasAmount = await contractMethods.estimateGas({ from: receiver });
    const gas = gasPriceBN.times(gasAmount).toString();

    return this.web3.eth.sendTransaction({
      from: sender,
      gasPrice: gasPrice,
      gas: 21000,
      to: receiver,
      value: this.web3.utils.toHex(gas),
    });
  }
}
