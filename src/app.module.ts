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

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ElectionsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'cekingx',
      password: 'root13',
      database: 'db_simvoni',
      autoLoadEntities: true,
      synchronize: true,
    }),
    EthereumModule,
  ],
  controllers: [
    AppController,
    SuperAdminController,
    ElectionAuthorityController,
  ],
  providers: [AppService, ErrorResponseService],
})
export class AppModule {}
