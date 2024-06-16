import { DataServicesModule } from 'src/core/abstracts/abstract.data-services.module';
import { Module } from '@nestjs/common';
import { ReservationsController } from './reservation.controller';
import { ReservationsService } from './reservation.service';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService],
  imports: [DataServicesModule],
})
export class ReservationsModule {}
