import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './jwt.strategy';
import { DataServicesModule } from 'src/core/abstracts/abstract.data-services.module';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService, JwtStrategy],
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    DataServicesModule,
  ],
})
export class AuthenticationModule {}
