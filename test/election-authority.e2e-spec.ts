import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { CustomLogger } from '../src/logger/logger.service';
import { Connection } from 'typeorm';
import { CreateElectionDto } from '../src/elections/dto/create-election.dto';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { ElectionsModule } from '../src/elections/elections.module';
import { EthereumModule } from '../src/ethereum/ethereum.module';
import { LoggerModule } from '../src/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionAuthorityController } from '../src/controller/election-authority/election-authority.controller';
import { Candidate } from 'src/elections/entity/candidate.entity';
import { AddCandidateDto } from 'src/elections/dto/add-candidate.dto';
import { SuperAdminController } from '../src/controller/super-admin/super-admin.controller';
import { ErrorResponseService } from '../src/helper/error-response/error-response.service';

const superAdmin = {
  name: 'Super Admin',
  username: 'super-admin',
  password: '$2b$10$8nfQAClO146d6qtN/GeCWu9hC62XiIvXp.lbG.Y8WE4WoN57GDxMW',
  walletAddress: '0x00b108e445c6fb0e38ef3a7d4ba5b4f934471236',
  userRoleId: '1',
};

const electionAuthority = {
  name: 'Election Authority',
  username: 'election-authority',
  password: '$2b$10$817eBIxNR8yKT2xq12mVtO6ZV3OULvwziM1sFpLGT2kj//XxHfq3.',
  walletAddress: '0x00d916c9f68084c4da0d8c69dc8882901f6cd6b7',
  userRoleId: '2',
};

const voter = {
  name: 'Voter',
  username: 'voter',
  password: '$2b$10$yr6HNf15aJY.eQHBPk0IZOmc.3kAPuNtPhjMR9MiWGLhW.EHI501W',
  walletAddress: '0x0007b3a2938f0441d7e92fb0a7a0c1d014c26fac',
  userRoleId: '3',
};

const election = {
  name: 'Election',
  description: 'Some election',
  start: '2021-09-22',
  end: '2021-09-23',
  status: 2,
  ea: 2,
};

const candidate = {
  id: 1,
  name: 'Candidate',
  nameSlug: 'candidate',
  visi: 'visi',
  election: 'Election',
  misi: ['misi', 'misi'],
  pengalaman: ['pengalaman', 'pengalaman'],
};

global.console.warn = jest.fn();
describe('ElectionAuthorityController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const clearDb = async () => {
    await connection.query('delete from election_participant');
    await connection.query(
      'alter table election_participant auto_increment = 1',
    );
    await connection.query('DELETE from misi');
    await connection.query('ALTER TABLE misi AUTO_INCREMENT = 1');
    await connection.query('DELETE from pengalaman');
    await connection.query('ALTER TABLE pengalaman AUTO_INCREMENT = 1');
    await connection.query('DELETE from candidate');
    await connection.query('ALTER TABLE candidate AUTO_INCREMENT = 1');
    await connection.query('DELETE from election');
    await connection.query('ALTER TABLE election AUTO_INCREMENT = 1');
    await connection.query('DELETE from user');
    await connection.query('ALTER TABLE user AUTO_INCREMENT = 1');
  };
  const populateDb = async () => {
    await connection.query(`
      insert into user
      (name, username, password, walletAddress, userRoleId)
      values
      ('${superAdmin.name}', '${superAdmin.username}', '${superAdmin.password}', '${superAdmin.walletAddress}', '${superAdmin.userRoleId}')
    `);
    await connection.query(`
      insert into user
      (name, username, password, walletAddress, userRoleId)
      values
      ('${electionAuthority.name}', '${electionAuthority.username}', '${electionAuthority.password}', '${electionAuthority.walletAddress}', '${electionAuthority.userRoleId}')
    `);
    await connection.query(`
      insert into user
      (name, username, password, walletAddress, userRoleId)
      values
      ('${voter.name}', '${voter.username}', '${voter.password}', '${voter.walletAddress}', '${voter.userRoleId}')
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
      controllers: [ElectionAuthorityController, SuperAdminController],
      providers: [ErrorResponseService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 2,
            name: electionAuthority.name,
            username: electionAuthority.username,
            role: 'election_authority',
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
    await clearDb();
    await populateDb();
  });

  describe('POST /election-authority/election', () => {
    it('Create Election', async () => {
      const createElection: CreateElectionDto = {
        name: election.name,
        description: election.description,
        start: election.start,
        end: election.end,
      };

      await request(app.getHttpServer())
        .post('/election-authority/election')
        .send(createElection)
        .expect(201);
      const dbData = await connection.query(
        `SELECT * from election where id=1`,
      );

      expect(dbData[0].name).toEqual(election.name);
    });
  });

  describe('GET /election-authority/elections', () => {
    it('Get All Election Created by Election Authority', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/election-authority/elections')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: expect.any(Number),
          name: election.name,
          description: election.description,
          start: election.start,
          end: election.end,
          status: 'draft',
          ea: electionAuthority.username,
        },
      ]);
    });
  });

  describe('GET /election-authority/election/:id', () => {
    it('Get Election By Id 1', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/election-authority/election/1')
        .expect(200);

      expect(body.data).toMatchObject({
        id: expect.any(Number),
        name: election.name,
        description: election.description,
        start: election.start,
        end: election.end,
        status: 'draft',
        ea: electionAuthority.username,
      });
    });
  });

  describe('POST /election-authority/add-candidate/:id', () => {
    it('Add Candidate to An Election', async () => {
      const addCandidate: AddCandidateDto = {
        name: candidate.name,
        visi: candidate.visi,
        misi: candidate.misi,
        pengalaman: candidate.pengalaman,
      };

      await request(app.getHttpServer())
        .post('/election-authority/add-candidate/1')
        .send(addCandidate)
        .expect(201);

      const dbData = await connection.query(
        `SELECT * from candidate where id=1`,
      );

      expect(dbData[0].name).toEqual(candidate.name);
    });
  });

  describe('GET /election-authority/election/:id/candidates', () => {
    it('Show All Candidate of An Election', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/election-authority/election/1/candidates')
        .expect(200);

      expect(body.data).toMatchObject([
        {
          id: expect.any(Number),
          name: candidate.name,
          visi: candidate.visi,
          misi: candidate.misi,
          pengalaman: candidate.pengalaman,
        },
      ]);
    });
  });

  describe('POST /election-authority/election/:id/ready', () => {
    it('Set Election Status to ready_to_deploy', async () => {
      await request(app.getHttpServer())
        .post('/election-authority/election/1/ready')
        .expect(201);

      const dbData = await connection.query(
        `SELECT election_status.status
        from election
        inner join election_status
        on election.statusId = election_status.id
        where election.id=1`,
      );
      expect(dbData[0].status).toEqual('ready_to_deploy');
    });
  });

  describe('POST /election-authority/election-participant/accept/:id', () => {
    it('Accept Participant', async () => {
      await connection.query(`
        insert into election_participant
        (electionId, participantId, statusId) 
        values
        (1, 3, 1)
      `);

      await request(app.getHttpServer())
        .post('/election-authority/election-participant/accept/1')
        .expect(201);

      const dbData = await connection.query(
        `select * from election_participant
        where id = 1`,
      );
      expect(dbData[0].statusId).toEqual(2);
    });
  });

  describe('POST /election-authority/election-participant/reject/:id', () => {
    it('Reject Participant', async () => {
      await request(app.getHttpServer())
        .post('/election-authority/election-participant/reject/1')
        .expect(201);

      const dbData = await connection.query(
        `select * from election_participant
        where id = 1`,
      );
      expect(dbData[0].statusId).toEqual(4);
    });
  });

  describe('POST /election-authority/start-election/:id', () => {
    it('Start Election', async () => {
      await request(app.getHttpServer()).post('/super-admin/deploy-election/1');

      await request(app.getHttpServer())
        .post('/election-authority/start-election/1')
        .expect(201);

      const dbData = await connection.query(
        `SELECT election_status.status
        from election
        inner join election_status
        on election.statusId = election_status.id
        where election.id=1`,
      );
      expect(dbData[0].status).toEqual('started');
    });
  });

  describe('POST /election-authority/end-election/:id', () => {
    it('End Election', async () => {
      await request(app.getHttpServer())
        .post('/election-authority/end-election/1')
        .expect(201);

      const dbData = await connection.query(
        `SELECT election_status.status
        from election
        inner join election_status
        on election.statusId = election_status.id
        where election.id=1`,
      );
      expect(dbData[0].status).toEqual('ended');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});