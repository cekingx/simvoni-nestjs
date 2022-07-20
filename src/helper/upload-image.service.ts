/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
const { Storage } = require('@google-cloud/storage');
const path = require('path');

@Injectable()
export class UploadImageService {
  bucket: any;

  constructor() {
    const storage = new Storage({
      projectId: 'proud-woods-237806',
      keyFilename: path.join(__dirname, '../../service-account.json'),
    });
    this.bucket = storage.bucket('simvoni-bucket');
  }

  async upload(file: Express.Multer.File) {
    const bucketFile = await this.bucket.file(
      `images/${uuid()}-${file.originalname}`,
    );
    await bucketFile.save(file.buffer);
    await bucketFile.makePublic();

    return bucketFile.name;
  }
}
