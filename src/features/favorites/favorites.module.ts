import { DataServicesModule } from 'src/core/abstracts/abstract.data-services.module';
import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService],
  imports: [DataServicesModule],
})
export class FavoritesModule {}
