import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/core/abstracts/abstract.data-services.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [DataServicesModule, HttpModule],
})
export class UsersModule {}
