import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  codeGenerator,
  generateDefaultPassword,
} from 'src/config/code-generator';
import { Result, fail, succeed } from 'src/config/http-response';
import { IGenericDataServices } from 'src/core/generics/generic-data.services';
import { EAccountType, EUserGender, getDefaultUserInfos } from './users.helper';
import { JwtService } from '@nestjs/jwt';
import { NewUserDto, UpdatePushTokenDto } from 'src/core/entities/users/user.dto';
import { User } from 'src/core/entities/users/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private dataServices: IGenericDataServices,
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  async create(data: NewUserDto): Promise<Result> {
    try {
      const by = await this.dataServices.users.findOne(data.by, '_id code account_type isActive isDeleted');
      if (!by) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: 'Not found!',
        });
      }
      if (!by.isActive || by.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This account is no longer active',
          error: 'Bad request',
        });
      }
      if (by.account_type !== EAccountType.SUPER_ADMIN) {
        return fail({
          code: HttpStatus.UNAUTHORIZED,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const salt = await bcrypt.genSalt();
      const password = data.password || generateDefaultPassword();
      const user: User = {
        code: codeGenerator('USR'),
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: await bcrypt.hash(password, salt),
        gender: data.gender || EUserGender.OTHER,
        address: data.address,
        push_tokens: data.push_tokens || [],
        company: null,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        account_type: EAccountType.SUPER_ADMIN,
        createdBy: by['_id'],
        lastUpdatedBy: by['_id'],
        defaultPassword: password,
      };
      const createdUser = await this.dataServices.users.create(user);
      const payload = {
        userId: createdUser['_id'],
        code: user.code,
      };
      return succeed({
        code: HttpStatus.CREATED,
        data: {
          ...getDefaultUserInfos(createdUser),
          access_token: this.jwtService.sign(payload),
        },
        message: 'User successfully registered.',
      });
    } catch (error) {
      if (error?.code === 11000) {
        return fail({
          code: 400,
          message: 'An user with the same infos like (phone) already exists.',
          error: 'Already exist',
        });
      } else {
        throw new HttpException(
          `Error while creating new user. Try again.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async updatePushToken(value: UpdatePushTokenDto): Promise<Result> {
    try {
      console.log('herre')
      const user = await this.dataServices.users.updatePushTokens(
        value.user,
        value.tokenValue,
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'User not found!',
          error: 'Not found ressource',
        });
      }
      return succeed({
        code: HttpStatus.OK,
        data: {
          token: value.tokenValue,
        },
      });
    } catch (error) {
      throw new HttpException(
        `Error while updating user push tokens. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
