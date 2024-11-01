import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../authentication/jwt.auth.guard";
import { User } from "src/core/entities/users/user.entity";
import { NewUserDto, RemoveUserDto, UpdatePushTokenDto, UserRegistrationDto, UsersListingDto } from "src/core/entities/users/user.dto";

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @ApiCreatedResponse({
    description: 'New user successfully registered.',
    type: User,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. most often duplicated values such as (phone, email).',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(@Body() newUserDto: NewUserDto) {
    return this.service.create(newUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Push token successfully added.',
    type: User,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiNotFoundResponse({
    description: 'User not found!',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/pushtokens')
  async updatePushTokens(@Body() value: UpdatePushTokenDto) {
    return this.service.updatePushToken(value);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Users list.',
    type: User,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiNotFoundResponse({
    description: 'User not found!',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/list')
  async list(@Body() value: UsersListingDto) {
    return this.service.list(value);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'User removed.',
    type: User,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiNotFoundResponse({
    description: 'User not found!',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/remove')
  async removeUser(@Body() value: RemoveUserDto) {
    return this.service.removeUser(value);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Push token successfully removed.',
    type: User,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured.',
  })
  @ApiNotFoundResponse({
    description: 'User not found!',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/pushtokens/remove')
  async removePushToken(@Body() value: UpdatePushTokenDto) {
    return this.service.removePushToken(value);
  }

  @Post('/registration')
  async registration(@Body() newUserDto: UserRegistrationDto) {
    return this.service.registration(newUserDto);
  }
}