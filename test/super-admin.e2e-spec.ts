import { ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminController } from '../src/controller/super-admin/super-admin.controller';
import { CreateEaDto } from '../src/users/create-ea.dto';
import { ElectionsModule } from '../src/elections/elections.module';
import { EthereumModule } from '../src/ethereum/ethereum.module';
import { UsersModule } from '../src/users/users.module';
import * as request from 'supertest';
import { ErrorResponseService } from '../src/helper/error-response/error-response.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { AuthModule } from '../src/auth/auth.module';
import { Any, Repository } from 'typeorm';
import { User } from '../src/users/user.entity';

describe('SuperAdminController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  const ea = {
    name: 'Election Authority',
    username: 'election-authority',
    password: 'password',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        ElectionsModule,
        EthereumModule,
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
      controllers: [SuperAdminController],
      providers: [ErrorResponseService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 1,
            name: 'user',
            username: 'username',
            role: 'super_admin',
          };
          return true;
        },
      })
      .compile();

    userRepository = moduleFixture.get('UserRepository');
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/super-admin/election-authority (POST)', () => {
    it('Create Election Authority', async () => {
      await request(app.getHttpServer())
        .post('/super-admin/election-authority')
        .send(ea)
        .expect(201);

      const dbData = await userRepository.query(
        `SELECT * from user where username='${ea.username}'`,
      );

      expect(dbData[0].username).toEqual(ea.username);
    });
  });

  describe('/super-admin/election-authority (GET)', () => {
    it('Get All Election Authority', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/super-admin/election-authority')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: 1,
          name: ea.name,
          username: ea.username,
          role: 'election_authority',
        },
      ]);
    });
  });

  describe('/super-admin/election-authority/:id', () => {
    it('Found EA with id 1', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/super-admin/election-authority/1')
        .expect(200);

      expect(body.data).toMatchObject({
        id: 1,
        name: ea.name,
        username: ea.username,
        role: 'election_authority',
      });
    });

    it('Not found EA with id 2', async () => {
      request(app.getHttpServer())
        .get('/super-admin/election-authority/2')
        .expect(404);
    });
  });

  describe('/super-admin/election-authority/set-wallet-address/id', () => {
    it('Create Address for user with id 1', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/super-admin/election-authority/set-wallet-address/1')
        .expect(201);

      const dbData = await userRepository.query(
        `SELECT * from user where username='${ea.username}'`,
      );

      expect(body.data).toMatchObject({
        address: expect.any(String),
      });
      expect(dbData[0].walletAddress).toEqual(expect.any(String));
    });
  });

  afterAll(async () => {
    await userRepository.query('DELETE from user');
    await userRepository.query('ALTER TABLE user AUTO_INCREMENT = 1');
    await app.close();
  });
});
