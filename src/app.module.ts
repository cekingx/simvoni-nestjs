import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/user.entity"

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
    })
  ],
  controllers: [AppController, CatsController],
  providers: [AppService, CatsService],
})
export class AppModule {}
