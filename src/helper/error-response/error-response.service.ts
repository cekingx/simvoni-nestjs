import { Injectable } from '@nestjs/common';

@Injectable()
export class ErrorResponseService {
  errorResponse(code: string) {
    switch (code) {
      case 'ER_DUP_ENTRY': {
        return {
          message: 'Username sudah digunakan',
          code: code,
        };
      }

      default: {
        return {
          message: 'Ada yang salah',
          code: 'SERVER_ERROR',
        };
      }
    }
  }

  badRequest() {
    return {
      message: 'Bad Request',
      code: 'BAD_REQUEST',
    };
  }

  notFound() {
    return {
      message: 'Not Found',
      code: 'NOT_FOUND',
    };
  }
}
