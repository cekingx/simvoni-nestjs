import { ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminController } from '../src/controller/super-admin/super-admin.controller';
import { ElectionsModule } from '../src/elections/elections.module';
import { EthereumModule } from '../src/ethereum/ethereum.module';
import { UsersModule } from '../src/users/users.module';
import * as request from 'supertest';
import { ErrorResponseService } from '../src/helper/error-response/error-response.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { AuthModule } from '../src/auth/auth.module';
import { Connection } from 'typeorm';
import { CustomLogger } from '../src/logger/logger.service';
import { LoggerModule } from '../src/logger/logger.module';
import {
  candidates,
  clearDb,
  eaDto,
  election,
  superAdmin,
  voter,
} from './shared';

global.console.warn = jest.fn();
describe('SuperAdminController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const populateDb = async (connection: Connection) => {
    await connection.query(`
      insert into user
      (name, username, password, walletAddress, userRoleId)
      values
      ('${superAdmin.name}', '${superAdmin.username}', '${superAdmin.password}', '${superAdmin.walletAddress}', '${superAdmin.userRoleId}'),
      ('${voter.name}', '${voter.username}', '${voter.password}', '${voter.walletAddress}', '${voter.userRoleId}')
    `);

    await connection.query(`
      insert into upgrade_role
      (userId, isUpgraded)
      values
      (2, false)
    `);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        ElectionsModule,
        EthereumModule,
        LoggerModule,
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
      .overrideProvider(CustomLogger)
      .useValue({
        log: jest.fn(),
        debug: jest.fn(),
      })
      .compile();

    connection = moduleFixture.get('Connection');
    app = moduleFixture.createNestApplication();
    await app.init();
    await clearDb(connection);
    await populateDb(connection);
  });

  describe('POST /super-admin/election-authority', () => {
    it('Create Election Authority', async () => {
      await request(app.getHttpServer())
        .post('/super-admin/election-authority')
        .send(eaDto)
        .expect(201);

      const dbData = await connection.query(
        `SELECT * from user where username='${eaDto.username}'`,
      );

      expect(dbData[0].username).toEqual(eaDto.username);
    });
  });

  describe('GET /super-admin/election-authority', () => {
    it('Get All Election Authority', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/super-admin/election-authority')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: 3,
          name: eaDto.name,
          username: eaDto.username,
          role: 'election_authority',
        },
      ]);
    });
  });

  describe('GET /super-admin/election-authority/:id', () => {
    it('Found EA with id 3', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/super-admin/election-authority/3')
        .expect(200);

      expect(body.data).toMatchObject({
        id: 3,
        name: eaDto.name,
        username: eaDto.username,
        role: 'election_authority',
      });
    });

    it('Not found EA with id 4', async () => {
      await request(app.getHttpServer())
        .get('/super-admin/election-authority/4')
        .expect(404);
    });
  });

  describe('POST /super-admin/election-authority/set-wallet-address/id', () => {
    it('Create Address for user with id 3', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/super-admin/election-authority/set-wallet-address/3')
        .expect(201);

      const dbData = await connection.query(
        `SELECT * from user where username='${eaDto.username}'`,
      );

      expect(body.data).toMatchObject({
        address: expect.any(String),
      });
      expect(dbData[0].walletAddress).toEqual(expect.any(String));
    });
  });

  describe('GET /super-admin/election/ready-to-deploy', () => {
    it('Get ready-to-deploy election', async () => {
      await connection.query(
        `insert into election 
        (name, description, start, end, electionAuthorityId, statusId)
        values 
        ('${election.name}', '${election.description}', '${election.start}', '${election.end}', '${election.ea}', '${election.status}')`,
      );

      const { body } = await request(app.getHttpServer())
        .get('/super-admin/election/ready-to-deploy')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: expect.any(Number),
          name: election.name,
          description: election.description,
          start: election.start,
          end: election.end,
          status: 'ready_to_deploy',
          ea: eaDto.username,
        },
      ]);
    });
  });

  describe('POST /super-admin/deploy-election/:electionId', () => {
    it('Deploy election to blockchain', async () => {
      await connection.query(
        `insert into candidate
        (name, visi, electionId, nameSlug)
        values
        ('${candidates[0].name}', '${candidates[0].visi}', ${candidates[0].electionId}, '${candidates[0].nameSlug}'),
        ('${candidates[1].name}', '${candidates[1].visi}', ${candidates[1].electionId}, '${candidates[1].nameSlug}')`,
      );

      const { body } = await request(app.getHttpServer())
        .post('/super-admin/deploy-election/1')
        .expect(201);

      expect(body.data).toMatchObject({
        address: expect.any(String),
      });
    });
  });

  describe('GET /super-admin/upgrade-role', () => {
    it('Get upgrade role request', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/super-admin/upgrade-role')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: expect.any(Number),
          isUpgraded: false,
          user: {
            id: expect.any(Number),
            name: voter.name,
            password: voter.password,
            username: voter.username,
          },
        },
      ]);
    });
  });

  describe('POST /super-admin/upgrade-role/1', () => {
    it('Upgrade role for upgrade request 1', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/super-admin/upgrade-role/1')
        .expect(201);

      const dbData = await connection.query(`SELECT * from user where id = 2`);

      expect(dbData[0].role).toEqual(2);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
