import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Result, fail, succeed } from 'src/config/http-response';
import { AuthDto } from 'src/core/entities/users/user.dto';
import { IGenericDataServices } from 'src/core/generics/generic-data.services';

@Injectable()
export class AuthenticationService {
  constructor(
    private dataServices: IGenericDataServices,
    private jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto): Promise<Result> {
    const result = await this.validateUser(authDto);
    if (!result.success) {
      return fail({
        code: HttpStatus.OK,
        message: result.message,
        error: 'Authentication failed!'
      })
    }
    const user = result.user;
    const payload = {
      userId: user['_id'],
      code: user.code,
    };
    const data = {
      ...user,
      _id: undefined,
      password: undefined,
      accountType: user.account_type,
      access_token: this.jwtService.sign(payload),
    };
    return succeed({ data });
  }

  async validateUser(authDto: AuthDto) {
    const { email, password, phone } = authDto;
    const user = await this.dataServices.users.authentication(phone);
    if (!user) {
      return {
        success: false,
        message: 'Account not found',
        user: null,
      }
    }
    if (user.isDeleted || !user.isActive) {
      return {
        success: false,
        message: 'Account is no longer active',
        user: null,
      }
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // throw new UnauthorizedException('Wrong password . Please Try again.')__;
      //test
      return {
        success: false,
        message: 'Wrong password',
        user: null,
      }
    }
    // const userInfos = await this.dataServices.users.getAccountInfos(
    //   user.code
    // );
    return {
      success: true,
      user: {
        ...user,
        _id: user['_id'],
      },
    };
  }

  async verifyToken(tokenValue: string): Promise<Result> {
    try {
      const result = this.jwtService.verify(tokenValue);
      if (!result.code) {
        throw new UnauthorizedException('Error when verifying the token.');
      }
      const user = await this.dataServices.users.findOne(result.code, '-_id -__v -publications -password');
      if (!user) {
        throw new UnauthorizedException('Error when verifying the token.');
      }
      // const payload = {
      //   userId: user['_id'],
      //   code: user.code,
      // };
      // const data = {
      //   ...user,
      //   _id: undefined,
      //   password: undefined,
      //   access_token: this.jwtService.sign(payload),
      // };
      return succeed({ data: user });
    } catch (error) {
      throw new UnauthorizedException('Error when verifying the token.');
    }
  }
}
