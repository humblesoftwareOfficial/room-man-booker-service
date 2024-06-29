import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Expo from 'expo-server-sdk';
import * as bcrypt from 'bcrypt';
import { Result, fail, succeed } from 'src/config/http-response';
import { IGenericDataServices } from 'src/core/generics/generic-data.services';
import { EAccountType, EUserGender } from '../users/users.helper';
import {
  codeGenerator,
  generateDefaultPassword,
} from 'src/config/code-generator';
import { User } from 'src/core/entities/users/user.entity';
import {
  AddUserToHouseDto,
  HouseUserDto,
  HousesListDto,
  NewHouseDto,
} from 'src/core/entities/houses/houses.dto';
import { House } from 'src/core/entities/houses/houses.entity';
import { __sendPushNotifications } from 'src/config/notifications';

@Injectable()
export class HousesService {
  constructor(
    private dataServices: IGenericDataServices,
  ) {}

  async create(data: NewHouseDto): Promise<Result> {
    try {
      const by = await this.dataServices.users.findOne(
        data.by,
        '_id code account_type isActive isDeleted company',
      );
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
      if (by.account_type !== EAccountType.ADMIN) {
        return fail({
          code: HttpStatus.UNAUTHORIZED,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const company = await this.dataServices.companies.findOne(
        data.company,
        '_id code',
      );
      if (!company) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'Company not found',
          error: 'Not found!',
        });
      }
      if (company.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'Company is no longer active',
          error: 'Bad request!',
        });
      }
      if (company['_id'].toString() !== by.company.toString()) {
        return fail({
          code: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized. You cannot do this action',
          error: 'Bad request!',
        });
      }
      const house: House = {
        code: codeGenerator('HSE'),
        name: data.name,
        description: data.description,
        address: data.address,
        company: company['_id'],
        createdAt: new Date(),
        createdBy: by['_id'],
        lastUpdatedBy: by['_id'],
        position: data.position,
      };
      const createdHouse = await this.dataServices.houses.create(house);
      await this.dataServices.companies.linkHousesToCompany(
        createdHouse['_id'],
        company['_id'],
      );
      return succeed({
        code: HttpStatus.CREATED,
        data: {
          code: createdHouse.code,
          name: createdHouse.name,
          description: createdHouse.description,
        },
      });
    } catch (error) {
      if (error?.code === 11000) {
        return fail({
          code: 400,
          message: 'A house with the same infos like (name) already exists.',
          error: 'Already exist',
        });
      } else {
        throw new HttpException(
          `Error while creating new house. Try again.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async addUserToHouse(data: AddUserToHouseDto): Promise<Result> {
    try {
      const by = await this.dataServices.users.findOne(
        data.by,
        '_id code account_type isActive isDeleted company push_tokens',
      );
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
      if (by.account_type !== EAccountType.ADMIN) {
        return fail({
          code: HttpStatus.UNAUTHORIZED,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const house = await this.dataServices.houses.findOne(
        data.house,
        '_id code company name',
      );
      if (!house) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'House not found',
          error: 'Not found!',
        });
      }
      if (house.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'House is no longer active',
          error: 'Bad request!',
        });
      }
      if (house.company.toString() !== by.company.toString()) {
        return fail({
          code: HttpStatus.UNAUTHORIZED,
          message: 'You cannot do this action',
          error: 'Bad request!',
        });
      }
      const user = await this.__createUser(data.user, by);
      await Promise.all([
        this.dataServices.users.update(user.createdUser.code, { company: house.company, house: house['_id']}),
        this.dataServices.houses.update(house.code, {
          $addToSet: {
            users: user.createdUser['_id'],
          }
        }),
        this.dataServices.companies.updateById(house.company, {
          $addToSet: {
            users: user.createdUser['_id'],
          }
        })
      ]);
      this.__pushNotificationsNewSupervisor(
        by,
        house,
        {
          ...data.user,
        },
        user.password,
      )
      return succeed({
        code: HttpStatus.CREATED,
        data: {
          code: user.createdUser.code,
          firstName: user.createdUser.firstName,
          lastName: user.createdUser.lastName,
          password: user.password,
        },
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

  async list (filter: HousesListDto): Promise<Result> {
    try {
      const { limit, page } = filter;
      const skip = (page - 1) * limit;
      let companiesId = [];
      if (filter.companies?.length) {
        const companies = await this.dataServices.companies.findAllByCodes(
          filter.companies,
          '_id',
        );
        companiesId = companies.flatMap((o) => o['_id']);
      }
      const houses = await this.dataServices.houses.list({
        limit: limit,
        skip,
        companies: companiesId,
      });
      if (!houses.length) {
        return succeed({
          code: HttpStatus.BAD_REQUEST,
          message: '',
          data: { houses: []},
        });
      }
      return succeed({
        data: {
          houses,
        }
      })
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while getting houses. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async __createUser(data: HouseUserDto, by: any) {
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
      push_tokens: [],
      company: null,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      account_type: EAccountType.SUPERVISOR,
      createdBy: by['_id'],
      lastUpdatedBy: by['_id'],
      defaultPassword: password,
    };
    const createdUser = await this.dataServices.users.create(user);
    return { createdUser, password };
  }

  __pushNotificationsNewSupervisor(user: any, house: any, supervisor: any, password) {
    try {
      const messages = [];
      for (const pushToken of user.push_tokens) {
        if (!Expo.isExpoPushToken(pushToken)) continue;
        messages.push({
          to: pushToken,
          sound: 'default',
          title: `Nouveau superviseur • ${house.name}`,
          subtitle: "Nouveau compte",
          body: `Nouveau superviseur: ${supervisor.firstName} ${supervisor.lastName}. Mot de passe: ${password}`,
          data: { withSome: `${supervisor.phone}` },
        });
      }
      __sendPushNotifications(messages);
    } catch (error) {
      console.log({ error })
    }
  }
}
