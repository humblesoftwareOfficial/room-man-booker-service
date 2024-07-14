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
import { NewUserDto, RemoveUserDto, UpdatePushTokenDto, UpdateUserDto, UsersListingDto } from 'src/core/entities/users/user.dto';
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
      const user = await this.dataServices.users.updatePushTokens(
        value.user,
        value.tokenValue,
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'User not found!',
          error: 'Not found resource',
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

  async removePushToken(value: UpdatePushTokenDto): Promise<Result> {
    try {
      const user = await this.dataServices.users.removePushTokens(
        value.user,
        value.tokenValue,
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'User not found!',
          error: 'Not found resource',
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

  async list(filter: UsersListingDto): Promise<Result> {
    try {
      const { limit, page } = filter;
      const skip = (page - 1) * limit;
      const company = await this.dataServices.companies.findOne(
        filter.company,
        '_id',
      );
      if (!company) {
        return fail({
          message: 'Company not found',
          error: 'Company not found',
        })
      }
      const result = await this.dataServices.users.list({
        companiesId: [company['_id']],
        skip,
        limit,
        roles: filter.roles,
      });
      if (!result?.length) {
        return succeed({
          code: HttpStatus.OK,
          message: '',
          data: {
            total: 0,
            users: [],
          },
        });
      }
      const total = result[0].total;
      const users = result.flatMap(i => ({
        ...i.users,
        total: undefined,
      }));
      return succeed({
        data: { users, total }
      })
    } catch (error) {
      console.log({ error });
      throw new HttpException("Error while getting users list", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeUser(data: RemoveUserDto):  Promise<Result> {
    try {
      const [by, user] = await Promise.all([
        this.dataServices.users.findOne(data.by, '_id company isDeleted isActive account_type'),
        this.dataServices.users.findOne(data.user, '_id code company'),
      ]);

      if (!by || !user) {
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
      if (by.account_type !== EAccountType.ADMIN) {
        return fail({
          message: 'You cannot do this action',
          error: 'You cannot do this action'
        });
      }
      if (by.company.toString() !== user.company.toString()) {
        return fail({
          message: 'You cannot do this action',
          error: 'You cannot do this action'
        });
      }
      await this.dataServices.users.update(user.code, {
        isDeleted: true,
        lastUpdatedBy: by['_id'],
        lastUpdatedDate: new Date()
      });
      return succeed({
        message: 'User removed!',
        data: {}
      })
    } catch (error) {
      console.log({ error });
      throw new HttpException("Error while removing user", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
