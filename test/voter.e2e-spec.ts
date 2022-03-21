import { ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { ElectionAuthorityController } from '../src/controller/election-authority/election-authority.controller';
import { SuperAdminController } from '../src/controller/super-admin/super-admin.controller';
import { VoterController } from '../src/controller/voter/voter.controller';
import { ElectionsModule } from '../src/elections/elections.module';
import { EthereumModule } from '../src/ethereum/ethereum.module';
import { LoggerModule } from '../src/logger/logger.module';
import { CustomLogger } from '../src/logger/logger.service';
import { UsersModule } from '../src/users/users.module';
import { Connection } from 'typeorm';
import {
  electionAuthority,
  voter,
  candidate,
  clearDb,
  populateUser,
  availableElection,
  followedElection,
  endedElection,
  populateCandidate,
} from './shared';
import { ErrorResponseService } from '../src/helper/error-response/error-response.service';

const populateElection = async (connection: Connection) => {
  await connection.query(`
    insert into election
    (name, description,start,end,electionAuthorityId,statusId)
    values
    ('${availableElection.name}','${availableElection.description}','${availableElection.start}','${availableElection.end}',${availableElection.ea},${availableElection.status});
  `);
  await connection.query(`
    insert into election
    (name, description,start,end,electionAuthorityId,statusId)
    values
    ('${followedElection.name}','${followedElection.description}','${followedElection.start}','${followedElection.end}',${followedElection.ea},${followedElection.status});
  `);
  await connection.query(`
    insert into election
    (name, description,start,end,electionAuthorityId,statusId)
    values
    ('${endedElection.name}','${endedElection.description}','${endedElection.start}','${endedElection.end}',${endedElection.ea},${endedElection.status});
  `);
};

global.console.warn = jest.fn();
describe('VoterController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

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
      controllers: [
        VoterController,
        ElectionAuthorityController,
        SuperAdminController,
      ],
      providers: [ErrorResponseService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: voter.id,
            name: voter.name,
            username: voter.username,
            role: 'voter',
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
    await populateUser(connection);
    await populateElection(connection);
    await populateCandidate(connection);
  });

  describe('POST /voter/join/:id', () => {
    it('Join Election', async () => {
      await request(app.getHttpServer()).post('/voter/join/2').expect(201);
      const dbData = await connection.query(
        `select * from election_participant where id=1`,
      );

      expect(dbData[0].participantId).toEqual(voter.id);
    });
  });

  describe('GET /voter/election-participation', () => {
    it('Get Participation', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/voter/election-participation')
        .expect(200);

      expect(body.data).toMatchObject({
        userId: expect.any(Number),
        username: voter.username,
        participation: [
          {
            participationId: expect.any(Number),
            electionId: followedElection.id,
            election: followedElection.name,
            status: 'waiting_approval',
          },
        ],
      });
    });
  });

  describe('GET /voter/available-election', () => {
    it('Get Available Election', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/voter/available-election')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: availableElection.id,
          name: availableElection.name,
          description: availableElection.description,
          start: availableElection.start,
          end: availableElection.end,
          status: 'started',
          ea: electionAuthority.name,
        },
      ]);
    });
  });

  describe('GET /voter/followed-election', () => {
    it('Get Followed Election', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/voter/followed-election')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: followedElection.id,
          name: followedElection.name,
          description: followedElection.description,
          start: followedElection.start,
          end: followedElection.end,
          status: 'started',
          ea: electionAuthority.name,
        },
      ]);
    });
  });

  describe('GET /voter/ended-election', () => {
    it('Get Ended Election', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/voter/ended-election')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: endedElection.id,
          name: endedElection.name,
          description: endedElection.description,
          start: endedElection.start,
          end: endedElection.end,
          status: 'ended',
          ea: electionAuthority.name,
        },
      ]);
    });
  });

  describe('GET /voter/election-detail/:id', () => {
    it('Get Election Detail', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/voter/election-detail/2')
        .expect(200);

      expect(body.data).toMatchObject({
        id: followedElection.id,
        name: followedElection.name,
        description: followedElection.description,
        start: followedElection.start,
        end: followedElection.end,
        status: 'started',
        ea: electionAuthority.name,
        participation_status: 'waiting_approval',
        candidates: [
          {
            id: expect.any(Number),
            name: candidate.name,
            visi: candidate.visi,
            misi: candidate.misi,
            pengalaman: candidate.pengalaman,
          },
        ],
      });
    });
  });

  describe('POST /voter/vote', () => {
    it('Vote on Election', async () => {
      await request(app.getHttpServer()).post('/super-admin/deploy-election/2');
      await request(app.getHttpServer()).post(
        '/election-authority/start-election/2',
      );

      await request(app.getHttpServer())
        .post('/voter/vote')
        .send({
          election_id: 2,
          candidate_id: 1,
        })
        .expect(201);

      const dbData = await connection.query(
        `select * from election_participant where id=1`,
      );

      expect(dbData[0].statusId).toEqual(3);
    });
  });

  describe('GET /voter/ended-election-detail/:id', () => {
    it('Get Ended Election Detail', async () => {
      await request(app.getHttpServer()).post(
        '/election-authority/end-election/2',
      );

      const { body } = await request(app.getHttpServer())
        .get('/voter/ended-election-detail/2')
        .expect(200);

      expect(body.data).toMatchObject({
        id: followedElection.id,
        name: followedElection.name,
        description: followedElection.description,
        start: followedElection.start,
        end: followedElection.end,
        status: 'ended',
        ea: electionAuthority.name,
        winner: candidate.name,
        candidates: [
          {
            id: expect.any(Number),
            name: candidate.name,
            visi: candidate.visi,
            vote_count: 1,
            misi: candidate.misi,
            pengalaman: candidate.pengalaman,
          },
        ],
      });
    });
  });

  describe('POST /voter/upgrade-role', () => {
    it('Request Upgrade Role', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/voter/upgrade-role')
        .expect(201);

      expect(body).toMatchObject({
        message: expect.any(String),
      });
    });
  });

  describe('GET /voter/upgrade-role/status', () => {
    it('Get Upgrade Role Status', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/voter/upgrade-role/status')
        .expect(200);

      expect(body).toMatchObject({
        message: 'Sedang Direview',
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
