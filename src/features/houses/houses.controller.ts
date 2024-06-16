import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt.auth.guard';
import { HousesService } from './houses.service';
import { House } from 'src/core/entities/houses/houses.entity';
import { AddUserToHouseDto, HousesListDto, NewHouseDto } from 'src/core/entities/houses/houses.dto';

@ApiTags('Houses')
@UseGuards(JwtAuthGuard)
@Controller('houses')
export class HousesController {
  constructor(private service: HousesService) {}

  @ApiCreatedResponse({
    description: 'New house successfully registered.',
    type: House,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. most often duplicated values such as name.',
  })
  @Post('/')
  async create(@Body() data: NewHouseDto) {
    return this.service.create(data);
  }

  @ApiCreatedResponse({
    description: 'New user added to house managers.',
    type: House,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. most often duplicated values such as (phone, email).',
  })
  @Post('/manager')
  async addUserToHouse(@Body() data: AddUserToHouseDto) {
    return this.service.addUserToHouse(data);
  }

  @ApiCreatedResponse({
    description: 'List of houses.',
    type: House,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request.',
  })
  @Post('/list')
  async list(@Body() data: HousesListDto) {
    return this.service.list(data);
  }
}
