import { Inject, Injectable } from '@nestjs/common';
import web3 from "web3";
import { AbiItem } from "web3-utils";
import * as contractFile from './BallotContract.json'

@Injectable()
export class ElectionService {
    constructor(@Inject('web3') private web3: web3) 
    { }

    getAccounts()
    {
        let data = this.web3.eth.getAccounts();
        console.log(contractFile);
        return data;
    }

    deployContract(sender: string): Promise<any>
    {
        let abi: any = contractFile.abi;
        let bytecode = contractFile.bytecode;
        let contract = new this.web3.eth.Contract(abi);

        return contract.deploy({
            data: bytecode
        })
        .send({
            from: sender,
            gas: 4712388
        })
        .then(contractInstance => {
            console.log(contractInstance);
            console.log(contractInstance.options.address);
            return contractInstance.options.address;
        })
        .catch(error => {
            console.log('Contract ' + error)
        });
    }
}
