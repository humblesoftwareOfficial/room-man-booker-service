import { Controller, Post, Get, Body, Param, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { User } from 'src/core/entities/users/user.entity';
import { AuthDto } from 'src/core/entities/users/user.dto';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiOkResponse({
    description: 'User successfully authenticated.',
    type: User,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred.',
  })
  @ApiBadRequestResponse({
    description:
      "Bad Request. Invalid auth credentials. You must give user's email and password /or user's card number",
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @Post('/login')
  async login(@Body() authDto: AuthDto) {
    if (!authDto.email && !authDto.phone) {
      return fail({
        error: `Authentication error`,
        code: HttpStatus.BAD_REQUEST,
        message: `Incomplete login information.`,
      });
    }
    return this.authService.login(authDto);
  }

  @Get('/verify/:token')
  async verifyToken(@Param('token') token: string) {
    return this.authService.verifyToken(token);
  }
}
