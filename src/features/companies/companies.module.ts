import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/core/abstracts/abstract.data-services.module';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  imports: [
    DataServicesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class CompaniesModule {}
