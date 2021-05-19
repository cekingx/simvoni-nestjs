import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthereumModule } from './ethereum/ethereum.module';
import { SuperAdminController } from './controller/super-admin/super-admin.controller';
import { ErrorResponseService } from './helper/error-response/error-response.service';
import { ElectionAuthorityController } from './controller/election-authority/election-authority.controller';
import { ElectionsModule } from './elections/elections.module';
import { VoterController } from './controller/voter/voter.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ElectionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    EthereumModule,
  ],
  controllers: [
    AppController,
    SuperAdminController,
    ElectionAuthorityController,
    VoterController,
  ],
  providers: [AppService, ErrorResponseService],
})
export class AppModule {}
