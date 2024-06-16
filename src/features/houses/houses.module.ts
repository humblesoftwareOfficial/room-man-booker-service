import { DataServicesModule } from 'src/core/abstracts/abstract.data-services.module';
import { Module } from '@nestjs/common';
import { HousesService } from './houses.service';
import { HousesController } from './houses.controller';

@Module({
  controllers: [HousesController],
  providers: [HousesService],
  imports: [DataServicesModule],
})
export class HousesModule {}
