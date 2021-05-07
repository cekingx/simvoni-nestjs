import { Inject, Module } from '@nestjs/common';
import { EthereumElectionService } from './election/ethereum-election.service';
import { WalletService } from './wallet/wallet.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require('web3');
import * as contractFile from './election/BallotContract.json';

const web3Factory = {
  provide: 'web3',
  useFactory: () => {
    return new web3('http://127.0.0.1:7545');
  },
};

const contractFactory = {
  provide: 'Contract',
  useFactory: () => {
    const web3Contract = new web3('http://127.0.0.1:7545');
    return new web3Contract.eth.Contract(contractFile.abi);
  },
};
@Module({
  providers: [
    EthereumElectionService,
    web3Factory,
    contractFactory,
    WalletService,
  ],
  exports: [EthereumElectionService, WalletService],
})
export class EthereumModule {}
