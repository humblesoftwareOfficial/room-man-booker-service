import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/core/abstracts/abstract.data-services.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [DataServicesModule, HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class UsersModule {}
