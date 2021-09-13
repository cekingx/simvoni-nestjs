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

  it('/super-admin/election-authority (POST)', async () => {
    await request(app.getHttpServer())
      .post('/super-admin/election-authority')
      .send(ea)
      .expect(201);

    const dbData = await userRepository.query(
      `SELECT * from user where username='${ea.username}'`,
    );

    expect(dbData[0].username).toEqual(ea.username);
  });

  it('/super-admin/election-authority (GET)', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/super-admin/election-authority')
      .expect(200);

    expect(body.data).toMatchObject([
      {
        id: expect.any(Number),
        name: ea.name,
        username: ea.username,
        role: 'election_authority',
      },
    ]);
  });

  afterAll(() => {
    userRepository.query('DELETE from user');
    app.close();
  });
});
