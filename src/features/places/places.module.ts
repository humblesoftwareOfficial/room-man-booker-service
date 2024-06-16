import { DataServicesModule } from 'src/core/abstracts/abstract.data-services.module';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [PlacesController],
  providers: [PlacesService],
  imports: [DataServicesModule],
})
export class PlacesModule {}
