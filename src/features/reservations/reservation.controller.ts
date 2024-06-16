import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservation.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt.auth.guard';
import { Reservation } from 'src/core/entities/reservation/reservation.entity';
import { NewReservationDto, ReservationListDto, UpdateReservationDto } from 'src/core/entities/reservation/reservation.dto';


@ApiTags('Reservation')
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private service: ReservationsService) {}

  @ApiCreatedResponse({
    description: 'New reservation successfully registered.',
    type: Reservation,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @Post('/new')
  async create(@Body() value: NewReservationDto) {
    return this.service.create(value);
  }

  @ApiCreatedResponse({
    description: 'Reservation successfully updated.',
    type: Reservation,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/update')
  async update(@Body() value: UpdateReservationDto) {
    return this.service.update(value);
  }

  @ApiCreatedResponse({
    description: 'List of reservations.',
    type: Reservation,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/list')
  async list(@Body() value: ReservationListDto) {
    return this.service.list(value);
  }
}
