import { Module } from '@nestjs/common';
import { ElectionService } from './election/election.service';
const web3 = require('web3');

const web3Factory = {
  provide: 'web3',
  useFactory: () => {
    return new web3('http://127.0.0.1:7545');
  }
}
@Module({
  providers: [ElectionService, web3Factory],
  exports: [ElectionService]
})
export class EthereumModule {}
