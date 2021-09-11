import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { AppController } from '../src/app.controller';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_TEST_NAME,
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
      controllers: [AppController],
    }).compile();

    repository = moduleFixture.get('UserRepository');
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/register (POST)', async () => {
    const user = {
      name: 'User Simvoni',
      username: 'user-simvoni',
      password: '12345',
      role: 'voter',
    };

    const { body } = await request(app.getHttpServer())
      .post('/register')
      .send(user)
      .expect(201);

    const dbData = await repository.query(
      `SELECT * from user where user.username='${user.username}'`,
    );

    expect(dbData[0].username).toEqual(user.username);
    expect(body.data).toEqual({
      id: expect.any(Number),
      name: user.name,
      username: user.username,
    });
  });

  afterAll(async () => {
    await repository.query('DELETE from user');
    app.close();
  });
});
