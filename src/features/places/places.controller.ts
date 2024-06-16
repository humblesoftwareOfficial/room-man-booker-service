import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt.auth.guard';
import { PlacesService } from './places.service';
import {
  AddMediasDto,
  NewPlaceDto,
  PlaceListDto,
  UpdatePlaceDto,
} from 'src/core/entities/places/places.dto';
import { Place } from 'src/core/entities/places/places.entity';
import { isValidPlaceCode } from './places.helper';
import { InvalidCodeException } from 'src/core/exceptions/invalid-code.exception';

@ApiTags('Places')
@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlacesController {
  constructor(private service: PlacesService) {}

  @ApiCreatedResponse({
    description: 'New place successfully registered.',
    type: Place,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/new')
  async create(@Body() value: NewPlaceDto) {
    return this.service.create(value);
  }

  @ApiCreatedResponse({
    description: 'New place successfully registered.',
    type: Place,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/addmedias')
  async addMedias(@Body() value: AddMediasDto) {
    return this.service.addMedias(value);
  }

  @ApiCreatedResponse({
    description: 'New place successfully registered.',
    type: Place,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/update')
  async update(@Body() value: UpdatePlaceDto) {
    return this.service.update(value);
  }

  @ApiCreatedResponse({
    description: 'List of places.',
    type: Place,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @Post('/list')
  async list(@Body() value: PlaceListDto) {
    return this.service.list(value);
  }


  @ApiOkResponse({
    description: '',
    type: Place,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Invalid user code.',
  })
  @ApiNotFoundResponse({
    description: 'Place not found.',
  })
  @Get(':code')
  async findOne(@Param('code') code: string) {
    if (!isValidPlaceCode(code)) {
      throw new InvalidCodeException('Place code is incorrect!');
    }
    return this.service.findOne(code);
  }
  // @ApiCreatedResponse({
  //   description: 'List of reservations by place.',
  //   type: Reservation,
  //   isArray: true,
  // })
  // @ApiInternalServerErrorResponse({
  //   description: 'Internal server error occured.',
  // })
  // @ApiBadRequestResponse({
  //   description: 'Bad Request.',
  // })
  // @UseGuards(JwtAuthGuard)
  // @Post('/reservations')
  // async getReservationsByPlace(@Body() value: GetReservationsByPlaceDto) {
  //   return this.service.getReservationsByPlace(value);
  // }
}
