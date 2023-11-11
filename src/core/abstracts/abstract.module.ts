import { Module } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from "../entities/users/user.entity";
import { IGenericDataServices } from "../generics/generic-data.services";
import { MongoDataServices } from "./abstract.service";


@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    {
      provide: IGenericDataServices,
      useClass: MongoDataServices,
    },
  ],
  exports: [IGenericDataServices],
})
export class AbstractMongoModule {}
