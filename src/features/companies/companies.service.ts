import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Result, fail, succeed } from 'src/config/http-response';
import {
  CompanyUserDto,
  NewCompanyDto,
} from 'src/core/entities/companies/companies.dto';
import { IGenericDataServices } from 'src/core/generics/generic-data.services';
import { EAccountType, EUserGender } from '../users/users.helper';
import { Company } from 'src/core/entities/companies/companies.entity';
import {
  codeGenerator,
  generateDefaultPassword,
} from 'src/config/code-generator';
import { User } from 'src/core/entities/users/user.entity';
import {
  GetStatsByCompanyDto,
  GetStatsCAByCompany,
} from 'src/core/entities/places/places.dto';
import {
  formatIntervalDate,
  getCurrentMonthInterval,
  getCurrentWeekInterval,
  isValidIntervalDate,
  stringToDate,
} from '../helpers/date.helper';
import { Types } from 'mongoose';
import Expo from 'expo-server-sdk';
import { __sendPushNotifications } from 'src/config/notifications';
import { EReservationStatus } from '../reservations/reservations.helper';

@Injectable()
export class CompaniesService {
  constructor(
    private dataServices: IGenericDataServices,
    private jwtService: JwtService,
  ) {}

  async create(data: NewCompanyDto): Promise<Result> {
    try {
      const by = await this.dataServices.users.findOne(
        data.by,
        '_id code account_type isActive isDeleted',
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
      if (by.account_type !== EAccountType.SUPER_ADMIN) {
        return fail({
          code: HttpStatus.UNAUTHORIZED,
          message: 'You cannot do this action',
          error: 'Bad request',
        });
      }
      const admin = await this.__createUser(data.owner, by);
      const company: Company = {
        code: codeGenerator('COM'),
        name: data.name,
        description: data.description,
        admin: admin.createdUser['_id'],
        createdAt: new Date(),
        createdBy: by['_id'],
        lastUpdatedBy: by['_id'],
      };
      const newCompany = await this.dataServices.companies.create(company);
      await this.dataServices.users.update(admin.createdUser.code, {
        company: newCompany['_id'],
      });
      return succeed({
        code: HttpStatus.CREATED,
        data: {
          code: newCompany.code,
          name: newCompany.name,
          description: newCompany.description,
          admin: {
            firstName: admin.createdUser.firstName,
            lastName: admin.createdUser.lastName,
            phone: admin.createdUser.phone,
            email: admin.createdUser.email,
            password: admin.password,
          },
        },
      });
    } catch (error) {
      if (error?.code === 11000) {
        return fail({
          code: 400,
          message: 'A company with the same infos like (name) already exists.',
          error: 'Already exist',
        });
      } else {
        throw new HttpException(
          `Error while creating new company. Try again.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async stats(data: GetStatsByCompanyDto): Promise<Result> {
    try {
      const company = await this.dataServices.companies.findOne(
        data.company,
        '-__v',
      );
      if (!company) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          error: 'Company not found',
        });
      }
      let house = null;
      let places = [];
      if (data.house) {
        house = await this.dataServices.houses.findOne(data.house, '_id code places name');
        if (!house) {
          return fail({
            code: HttpStatus.NOT_FOUND,
            error: 'House not found',
          });
        }
        places = house.places.flatMap((p) => ({
          _id: p
        }));
      } else {
        places = await this.dataServices.places.getPlacesByCompany({
          company: company['_id'],
        });
      }
      if (!places?.length) {
        return succeed({
          data: {
            places: 0,
            dailyCA: 0,
            weeklyCA: 0,
            monthlyCA: 0,
          },
        });
      }
      const week = getCurrentWeekInterval();
      const month = getCurrentMonthInterval();
      const todayStart = new Date();
      const todayEnd = new Date();
      todayStart.setHours(0, 0, 0, 0);
      todayEnd.setHours(23, 59, 59);

      const [
        placesCADaily,
        placesCAWeek,
        placesCAMonth,
        totalReservations,
        acceptedReservations,
        cancelledReservations,
        currentReservations,
      ] = await Promise.all([
        this.dataServices.reservations.getPlaceTotalAmount({
          places: places.flatMap((p) => p['_id']),
          startDate: todayStart,
          endDate: todayEnd,
        }),
        this.dataServices.reservations.getPlaceTotalAmount({
          places: places.flatMap((p) => p['_id']),
          startDate: week.start,
          endDate: week.end,
        }),
        this.dataServices.reservations.getPlaceTotalAmount({
          places: places.flatMap((p) => p['_id']),
          startDate: month.start,
          endDate: month.end,
        }),
        this.dataServices.reservations.getRecap({
          places: places.flatMap((p) => p['_id']),
        }),
        this.dataServices.reservations.getRecap({
          places: places.flatMap((p) => p['_id']),
          status: [
            EReservationStatus.ACCEPTED,
            EReservationStatus.ENDED,
            EReservationStatus.IN_PROGRESS,
          ],
        }),
        this.dataServices.reservations.getRecap({
          places: places.flatMap((p) => p['_id']),
          status: [EReservationStatus.CANCELLED],
        }),
        this.dataServices.reservations.getRecap({
          places: places.flatMap((p) => p['_id']),
          status: [EReservationStatus.IN_PROGRESS],
        }),
      ]);
      const statusCount = places.reduce((acc, place) => {
        if (!acc[place.currentStatus]) {
          acc[place.currentStatus] = 0;
        }
        acc[place.currentStatus] += 1;
        return acc;
      }, {});

      return succeed({
        data: {
          // places,
          statusCount,
          totalPlaces: places.length,
          placesCADaily: placesCADaily.reduce(
            (sum, place) => sum + place.amount,
            0,
          ),
          placesCAWeek: placesCAWeek.reduce(
            (sum, place) => sum + place.amount,
            0,
          ),
          placesCAMonth: placesCAMonth.reduce(
            (sum, place) => sum + place.amount,
            0,
          ),
          totalReservations: totalReservations?.length
            ? totalReservations[0]
            : { count: 0 },
          acceptedReservations: acceptedReservations?.length
            ? acceptedReservations[0]
            : { count: 0 },
          cancelledReservations: cancelledReservations?.length
            ? cancelledReservations[0]
            : { count: 0 },
          currentReservations: currentReservations?.length
            ? currentReservations[0]
            : { count: 0 },
        },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while getting stats infos. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStatsRecap(data: GetStatsCAByCompany): Promise<Result> {
    try {
      const user = await this.dataServices.users.findOne(
        data.by,
        '_id code company isDeleted isActive',
      );
      if (!user) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          message: 'User not found!',
          error: 'Not found!',
        });
      }
      if (!user.isActive || user.isDeleted) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'This account is no longer active',
          error: 'Bad request',
        });
      }
      const company = await this.dataServices.companies.findOne(
        data.company,
        '-__v',
      );
      if (!company) {
        return fail({
          code: HttpStatus.NOT_FOUND,
          error: 'Company not found',
        });
      }
      if (user.company.toString() !== company['_id'].toString()) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          error: 'Bad request!',
        });
      }
      let houses = []
      if (data.houses?.length) {
        houses = await this.dataServices.houses.findAllByCodes(data.houses, '_id code name company');
        if (houses.length !== data.houses.length) {
          return fail({
            code: HttpStatus.NOT_FOUND,
            error: 'House not found',
            message: 'There ae one or more houses not found'
          })
        }
      }
      const places = await this.dataServices.places.getPlacesByCompany({
        company: company['_id'],
        houses: houses?.length ? houses?.flatMap((h) => h['_id']) : [],
      });
      if (!places?.length) {
        return succeed({
          data: {
            ca: 0,
            totalReservations: { count: 0 },
            doneReservations: { count: 0 },
            cancelledReservations: { count: 0 },
            currentReservations: { count: 0 },
          },
        });
      }

      const startDate = stringToDate(data.startDate);
      const endDate = stringToDate(data.endDate);
      if (!isValidIntervalDate(startDate, endDate)) {
        return fail({
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid date range filter!',
          error: 'Bad request!',
        });
      }
      const { formattedEndDate } = formatIntervalDate(startDate, endDate);
      const [
        ca,
        totalReservations,
        doneReservations,
        cancelledReservations,
        currentReservations,
      ] = await Promise.all([
        this.dataServices.reservations.getPlaceTotalAmount({
          places: places.flatMap((p) => p['_id']),
          startDate: startDate,
          endDate: formattedEndDate,
        }),

        this.dataServices.reservations.getRecap({
          places: places.flatMap((p) => p['_id']),
          startDate: startDate,
          endDate: formattedEndDate,
        }),
        this.dataServices.reservations.getRecap({
          places: places.flatMap((p) => p['_id']),
          status: [
            // EReservationStatus.ACCEPTED,
            EReservationStatus.ENDED,
            // EReservationStatus.IN_PROGRESS,
          ],
          startDate: startDate,
          endDate: formattedEndDate,
        }),
        this.dataServices.reservations.getRecap({
          places: places.flatMap((p) => p['_id']),
          status: [EReservationStatus.CANCELLED],
          startDate: startDate,
          endDate: formattedEndDate,
        }),
        this.dataServices.reservations.getRecap({
          places: places.flatMap((p) => p['_id']),
          status: [EReservationStatus.IN_PROGRESS],
          startDate: startDate,
          endDate: formattedEndDate,
        }),
      ]);
      return succeed({
        data: {
          ca: ca.reduce(
            (sum, place) => sum + place.amount,
            0,
          ),
          totalReservations: totalReservations?.length
            ? totalReservations[0]
            : { count: 0 },
          doneReservations: doneReservations?.length
            ? doneReservations[0]
            : { count: 0 },
          cancelledReservations: cancelledReservations?.length
            ? cancelledReservations[0]
            : { count: 0 },
          currentReservations: currentReservations?.length
            ? currentReservations[0]
            : { count: 0 },
        },
      });
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        `Error while getting stats CA. Try again.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async __createUser(data: CompanyUserDto, by: any) {
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
      account_type: EAccountType.ADMIN,
      createdBy: by['_id'],
      lastUpdatedBy: by['_id'],
      defaultPassword: password,
    };
    const createdUser = await this.dataServices.users.create(user);
    return { createdUser, password };
  }
}
