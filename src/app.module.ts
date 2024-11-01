import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './core/middlewares/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './features/users/users.module';
import { AuthenticationModule } from './features/authentication/authentication.module';
import { CompaniesModule } from './features/companies/companies.module';
import { HousesModule } from './features/houses/houses.module';
import { PlacesModule } from './features/places/places.module';
import { ReservationsModule } from './features/reservations/reservation.module';
import { FavoritesModule } from './features/favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.${process.env.NODE_ENV}.env`],
    }),
    UsersModule,
    AuthenticationModule,
    CompaniesModule,
    HousesModule,
    PlacesModule,
    ReservationsModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
