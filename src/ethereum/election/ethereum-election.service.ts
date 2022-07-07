import { Inject, Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import web3 from 'web3';
import { AccountService } from '../account/account.service';
import * as contractFile from './BallotContract.json';
import * as electionAbi from './Election.json';
import {
  BigNumberish,
  Contract,
  ContractFactory,
  ethers,
  utils,
  Wallet,
} from 'ethers';

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

  async deployNewContract(
    name: string,
    eaPrivateKey: string,
    weight: Array<number>,
  ) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const deployer = new Wallet(eaPrivateKey);
    const factory = new ContractFactory(
      electionAbi.abi,
      electionAbi.bytecode,
      deployer.connect(provider),
    );

    const contract = await factory.deploy(name, weight);
    await contract.deployTransaction.wait();

    return contract.address;
  }

  async addCandidate(address: string, eaPrivateKey: string, name: string) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const signer = new Wallet(eaPrivateKey);
    const contract = new Contract(
      address,
      electionAbi.abi,
      signer.connect(provider),
    );

    const tx = await contract.addCandidate(name);
    return tx.wait();
  }

  /**
   * TODO:
   * estimate for any method
   */
  async estimate(address: string): Promise<BigNumberish> {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545',
    );
    const signer = new Wallet(process.env.FAUCET_PRIVATE_KEY);
    const contract = new Contract(
      address,
      electionAbi.abi,
      signer.connect(provider),
    );

    const gasPrice = await provider.getGasPrice();
    console.log(gasPrice);
    const result = await contract.estimateGas.abstain();
    return result.mul(gasPrice).mul(5);
  }

  async start(address: string, eaPrivateKey: string) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const signer = new Wallet(eaPrivateKey);
    const contract = new Contract(
      address,
      electionAbi.abi,
      signer.connect(provider),
    );

    const tx = await contract.startElection();
    return tx.wait();
  }

  async end(address: string, eaPrivateKey: string) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const signer = new Wallet(eaPrivateKey);
    const contract = new Contract(
      address,
      electionAbi.abi,
      signer.connect(provider),
    );

    const tx = await contract.endElection();
    return tx.wait();
  }

  async abstain(address: string, privateKey: string) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const wallet = new Wallet(privateKey);
    const contract = new Contract(address, electionAbi.abi);

    const gas = await this.estimate(address);
    console.log(gas.toString());
    (await this.sendEtherFromFaucet(wallet.address, gas)).wait();
    const tx = await contract.connect(wallet.connect(provider)).abstain();
    return tx.wait();
  }

  async vote(
    address: string,
    privateKey: string,
    weightType: number,
    candidateId: number,
  ) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545',
    );
    const wallet = new Wallet(privateKey);
    const contract = new Contract(address, electionAbi.abi);
    const gas = await this.estimate(address);
    console.log(gas.toString());
    (await this.sendEtherFromFaucet(wallet.address, gas)).wait();
    const tx = await contract
      .connect(wallet.connect(provider))
      .vote(weightType, candidateId);
    return tx.wait();
  }

  async getCandidate(address: string, id: number) {
    const contract = new Contract(address, electionAbi.abi);
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );

    const count = await contract.connect(provider).getCandidate(id);
    return count;
  }

  async sendEtherFromFaucet(destination: string, amount: BigNumberish) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const faucet = new Wallet(process.env.FAUCET_PRIVATE_KEY);
    const result = await faucet.connect(provider).sendTransaction({
      to: destination,
      value: amount,
    });

    return result;
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

  /**
   * @deprecated
   */
  async voteOld(
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

  /**
   * @deprecated
   */
  async getVoteCount(contract: any, index: number) {
    const result = await contract.methods.get_candidate(index).call();

    return result;
  }
}
