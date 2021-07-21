import { Inject, Injectable } from '@nestjs/common';
import { throwError } from 'rxjs';
import web3 from 'web3';
import * as contractFile from './BallotContract.json';

@Injectable()
export class EthereumElectionService {
  private abi: any;
  private bytecode: any;

  constructor(
    @Inject('web3') private web3: web3,
    @Inject('Contract') private Contract: any,
  ) {
    this.abi = contractFile.abi;
    this.bytecode = contractFile.bytecode;
  }

  getAccounts() {
    const data = this.web3.eth.getAccounts();
    return data;
  }

  async deployContract(sender: string): Promise<any> {
    try {
      const contractInstance = await this.Contract.deploy({
        data: this.bytecode,
      }).send({
        from: sender,
        gas: process.env.ETH_CONTRACT_GAS,
      });
      return contractInstance.options.address;
    } catch (error) {
      console.log('Contract ' + error);
    }
  }

  connectToContract(address: string): Promise<any> {
    const contract = this.Contract;
    contract.options.address = address;
    contract.handleRevert = true;
    return contract;
  }

  async registerCandidate(contract: any, name: string, sender: string) {
    const receipt = await contract.methods
      .register_candidate(name)
      .send({ from: sender });

    return receipt;
  }

  async vote(contract: any, name_slug: string, sender: string) {
    const receipt = await contract.methods
      .vote(name_slug)
      .send({ from: sender });

    return receipt;
  }

  async startElection(contract: any, sender: string) {
    const receipt = await contract.methods
      .start_election()
      .send({ from: sender });

    return receipt;
  }

  async endElection(contract: any, sender: string) {
    const receipt = await contract.methods
      .end_election()
      .send({ from: sender });

    return receipt;
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
