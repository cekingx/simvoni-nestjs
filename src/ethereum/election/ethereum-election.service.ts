import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import web3 from 'web3';
import { AccountService } from '../account/account.service';
import * as contractFile from './BallotContract.json';

@Injectable()
export class EthereumElectionService {
  private abi: any;
  private bytecode: any;

  constructor(
    @Inject('web3') private web3: web3,
    @Inject('Contract') private Contract: any,
    private accountService: AccountService,
    private logger: CustomLogger,
  ) {
    this.abi = contractFile.abi;
    this.bytecode = contractFile.bytecode;
  }

  getAccounts() {
    const data = this.web3.eth.getAccounts();
    return data;
  }

  async deployContract(sender: string, senderPassword: string): Promise<any> {
    this.accountService.unlockAccount(sender, senderPassword);

    try {
      const logger = this.logger;
      const contractInstance = await this.Contract.deploy({
        data: this.bytecode,
      })
        .send({
          from: sender,
          gas: process.env.ETH_CONTRACT_GAS,
        })
        .on('error', function (error) {
          logger.error('[deployErr] ' + error);
        })
        .on('transactionHash', function (transactionHash) {
          logger.log('[trxHash] ' + transactionHash);
        })
        .on('receipt', function (receipt) {
          logger.log('[contractAddress] ' + receipt.contractAddress); // contains the new contract address
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          logger.debug('[confirmation] ' + confirmationNumber, receipt);
        });
      return contractInstance.options.address;
    } catch (error) {
      this.logger.error('[DeployContractErr] ' + error);
    }
  }

  connectToContract(address: string): Promise<any> {
    const contract = this.Contract;
    contract.options.address = address;
    return contract;
  }

  async registerCandidate(
    contract: any,
    name: string,
    sender: string,
    senderPassword: string,
  ) {
    this.accountService.unlockAccount(sender, senderPassword);

    try {
      const logger = this.logger;
      const receipt = await contract.methods
        .register_candidate(name)
        .send({
          from: sender,
          gas: '0xDBBA0',
        })
        .on('error', function (error) {
          logger.error('[RegisterErr] ' + error);
        })
        .on('transactionHash', function (transactionHash) {
          logger.log('[registerTrxHash] ' + transactionHash);
        })
        .on('receipt', function (receipt) {
          logger.log('[registerReceipt] ' + receipt); // contains the new contract address
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          logger.debug('[registerConfirmation] ' + confirmationNumber, receipt);
        });

      return receipt;
    } catch (error) {
      this.logger.error('[RegCandidateErr ]' + error);
    }
  }

  async vote(
    contract: any,
    name_slug: string,
    sender: string,
    senderPassword: string,
  ) {
    this.accountService.unlockAccount(sender, senderPassword);

    try {
      const receipt = await contract.methods
        .vote(name_slug)
        .send({ from: sender, gas: '0xdbba0' })
        .on('error', function (error) {
          console.log('[StartErr] ' + error);
        })
        .on('transactionHash', function (transactionHash) {
          console.log('[startTrxHash] ' + transactionHash);
        })
        .on('receipt', function (receipt) {
          console.log('[startReceipt] ' + receipt); // contains the new contract address
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          console.log('[startConfirmation] ' + confirmationNumber, receipt);
        });

      return receipt;
    } catch (error) {
      console.log('[VoteErr ]' + error);
    }
  }

  async startElection(contract: any, sender: string, senderPassword: string) {
    this.accountService.unlockAccount(sender, senderPassword);

    try {
      const receipt = await contract.methods
        .start_election()
        .send({ from: sender, gas: '0xdbba0' })
        .on('error', function (error) {
          console.log('[StartErr] ' + error);
        })
        .on('transactionHash', function (transactionHash) {
          console.log('[startTrxHash] ' + transactionHash);
        })
        .on('receipt', function (receipt) {
          console.log('[startReceipt] ' + receipt); // contains the new contract address
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          console.log('[startConfirmation] ' + confirmationNumber, receipt);
        });

      return receipt;
    } catch (error) {
      console.log('[StartElecErr] ' + error);
    }
  }

  async endElection(contract: any, sender: string, senderPassword: string) {
    this.accountService.unlockAccount(sender, senderPassword);

    try {
      const receipt = await contract.methods
        .end_election()
        .send({ from: sender, gas: '0xdbba0' });

      return receipt;
    } catch (error) {
      console.log('[EndElecErr] ' + error);
    }
  }

  async getNumCandidates(contract: any) {
    const numCanidates = await contract.methods.get_num_candidates().call();

    return numCanidates;
  }

  async getVoteCount(contract: any, index: number) {
    const result = await contract.methods.get_candidate(index).call();

    return result;
  }
}
