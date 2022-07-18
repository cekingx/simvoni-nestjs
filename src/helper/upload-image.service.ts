/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
const { Storage } = require('@google-cloud/storage');
const path = require('path');

@Injectable()
export class UploadImageService {
  storage: any;

  constructor() {
    this.storage = new Storage({
      projectId: 'proud-woods-237806',
      keyFilename: path.join(__dirname, '../../service-account.json'),
    });
  }

  async upload() {
    const [buckets] = await this.storage.bucket('simvoni-bucket').getFiles();
    console.log(buckets);

    return true;
  }
}
