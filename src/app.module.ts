import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/user.entity"
import { EthereumModule } from './ethereum/ethereum.module';
import { SuperAdminController } from './controller/super-admin/super-admin.controller';

@Module({
  imports: [
    AuthModule, 
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root13',
      database: 'db_simvoni2',
      autoLoadEntities: true,
      synchronize: true
    }),
    EthereumModule
  ],
  controllers: [AppController, SuperAdminController],
  providers: [AppService],
})
export class AppModule {}
