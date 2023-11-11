import { Module } from '@nestjs/common';
import { AbstractMongoModule } from './abstract.module';

@Module({
  imports: [AbstractMongoModule],
  exports: [AbstractMongoModule],
})
export class DataServicesModule {}
