import { Inject, Injectable } from '@nestjs/common';
import web3 from 'web3';
import * as contractFile from './BallotContract.json';

@Injectable()
export class EthereumElectionService {
  private abi: any;
  private bytecode: any;

  constructor(@Inject('web3') private web3: web3) {
    this.abi = contractFile.abi;
    this.bytecode = contractFile.bytecode;
  }

  getAccounts() {
    const data = this.web3.eth.getAccounts();
    console.log(contractFile);
    return data;
  }

  async deployContract(sender: string): Promise<any> {
    const contract = new this.web3.eth.Contract(this.abi);

    try {
      const contractInstance = await contract
        .deploy({
          data: this.bytecode,
        })
        .send({
          from: sender,
          gas: 550000,
        });
      console.log(contractInstance.options.address);
      return contractInstance.options.address;
    } catch (error) {
      console.log('Contract ' + error);
    }
  }

  connectToContract(address: string): Promise<any> {
    const contract: any = new this.web3.eth.Contract(this.abi, address);
    contract.handleRevert = true;
    return contract;
  }

  async registerCandidate(contract: any, name: string, sender: string) {
    const receipt = await contract.methods
      .register_candidate(name)
      .send({ from: sender });

    return receipt;
  }

  async getNumCandidates(contract: any) {
    const numCanidates = await contract.methods.get_num_candidates().call();

    return numCanidates;
  }
}
