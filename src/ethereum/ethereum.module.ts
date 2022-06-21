import { Inject, Module } from '@nestjs/common';
import { EthereumElectionService } from './election/ethereum-election.service';
import { WalletService } from './wallet/wallet.service';
import { AccountService } from './account/account.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require('web3');
import * as contractFile from './election/BallotContract.json';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '../logger/logger.module';
import { ethers } from 'ethers';

const web3Factory = {
  provide: 'web3',
  useFactory: () => {
    return new web3(process.env.ETH_ENDPOINT);
  },
};

const ethersFactory = {
  provide: 'ethers',
  useFactory: () => {
    return new ethers.providers.JsonRpcProvider('http://localhost:8545');
  },
};

const contractFactory = {
  provide: 'Contract',
  useFactory: () => {
    const web3Contract = new web3(process.env.ETH_ENDPOINT);
    return new web3Contract.eth.Contract(contractFile.abi);
  },
};
@Module({
  imports: [HttpModule, LoggerModule],
  providers: [
    EthereumElectionService,
    web3Factory,
    contractFactory,
    ethersFactory,
    WalletService,
    AccountService,
  ],
  exports: [EthereumElectionService, WalletService],
})
export class EthereumModule {}
