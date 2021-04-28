import { Module } from '@nestjs/common';
import { EthereumElectionService } from './election/ethereum-election.service';
import { WalletService } from './wallet/wallet.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const web3 = require('web3');

const web3Factory = {
  provide: 'web3',
  useFactory: () => {
    return new web3('http://127.0.0.1:7545');
  },
};
@Module({
  providers: [EthereumElectionService, web3Factory, WalletService],
  exports: [EthereumElectionService, WalletService],
})
export class EthereumModule {}
