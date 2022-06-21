import { Inject, Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import web3 from 'web3';
import { AccountService } from '../account/account.service';
import * as contractFile from './BallotContract.json';
import * as electionAbi from './Election.json';
import { ContractFactory, ethers, Wallet } from 'ethers';

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

  async deployNewContract() {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const deployer = new Wallet(process.env.FAUCET_PRIVATE_KEY);
    const factory = new ContractFactory(
      electionAbi.abi,
      electionAbi.bytecode,
      deployer.connect(provider),
    );

    const contract = await factory.deploy('Pemira HMTI', [1]);
    await contract.deployTransaction.wait();

    return contract.address;
  }

  /**
   * @deprecated
   */
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
      const logger = this.logger;
      const receipt = await contract.methods
        .vote(name_slug)
        .send({ from: sender, gas: '0xdbba0' })
        .on('error', function (error) {
          logger.error('[StartErr] ' + error);
        })
        .on('transactionHash', function (transactionHash) {
          logger.log('[startTrxHash] ' + transactionHash);
        })
        .on('receipt', function (receipt) {
          logger.log('[startReceipt] ' + receipt); // contains the new contract address
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          logger.debug('[startConfirmation] ' + confirmationNumber, receipt);
        });

      return receipt;
    } catch (error) {
      this.logger.error('[VoteErr ]' + error);
    }
  }

  async startElection(contract: any, sender: string, senderPassword: string) {
    this.accountService.unlockAccount(sender, senderPassword);

    try {
      const logger = this.logger;
      const receipt = await contract.methods
        .start_election()
        .send({ from: sender, gas: '0xdbba0' })
        .on('error', function (error) {
          logger.error('[StartErr] ' + error);
        })
        .on('transactionHash', function (transactionHash) {
          logger.log('[startTrxHash] ' + transactionHash);
        })
        .on('receipt', function (receipt) {
          logger.log('[startReceipt] ' + receipt);
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          logger.debug('[startConfirmation] ' + confirmationNumber, receipt);
        });

      return receipt;
    } catch (error) {
      this.logger.error('[StartElecErr] ' + error);
    }
  }

  async endElection(contract: any, sender: string, senderPassword: string) {
    this.accountService.unlockAccount(sender, senderPassword);

    try {
      const logger = this.logger;
      const receipt = await contract.methods
        .end_election()
        .send({ from: sender, gas: '0xdbba0' })
        .on('error', function (error) {
          logger.error('[EndErr] ' + error);
        })
        .on('transactionHash', function (transactionHash) {
          logger.log('[endTrxHash] ' + transactionHash);
        })
        .on('receipt', function (receipt) {
          logger.log('[endReceipt] ' + receipt);
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          logger.debug('[endConfirmation] ' + confirmationNumber, receipt);
        });

      return receipt;
    } catch (error) {
      this.logger.error('[EndElecErr] ' + error);
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
