/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as moment from 'moment';

@ValidatorConstraint({ name: 'IsValidDate', async: false })
export class IsValidDate implements ValidatorConstraintInterface {
  validate(value: string) {
    if (typeof value === 'string') {
      return (
        /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/\-]\d{4}$/.test(
          value,
        ) && moment(value, 'DD/MM/YYYY').isValid()
      );
    }
    return false;
  }

  defaultMessage({ property }) {
    return `${property} must be a valid date (Required format: DD/MM/YYYY)`;
  }
}

@ValidatorConstraint({ name: 'IsValidFullDate', async: false })
export class IsValidFullDate implements ValidatorConstraintInterface {
  validate(value: string) {
    if (typeof value === 'string') {
      return /^([1-9]|([012][0-9])|(3[01]))[\/]([0]{0,1}[1-9]|1[012])[\/]\d\d\d\d (20|21|22|23|[0-1]?\d):[0-5]?\d:[0-5]?\d$/.test(
        value,
      );
    }
    return false;
  }

  defaultMessage({ property }) {
    return `${property} must be a valid full date (Required format: DD/MM/YYYY HH:mm:ss)`;
  }
}

@ValidatorConstraint({ name: 'ConvertStringToDate', async: false })
export class ConvertStringToDate implements ValidatorConstraintInterface {
  validate(dateF: string, args: ValidationArguments) {
    args.object[args.constraints[0]] = 'test';
    return true;
    /* return dateHelper.isValidIntervall(
      args.object[args.constraints[0]],
      endDate,
    ); */
  }

  defaultMessage(args: ValidationArguments) {
    return 'Incorrect date.';
  }
}
/**The date string must be in DD/MM/YYYY Format */
export const stringToDate = (date: string) => {
  const dateParts = date.split('/');
  return new Date(`${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`);
};

export const getDatesBetween = (from: Date, to: Date) => {
  const dates: Date[] = [];
  let currentDate = from;
  const addDays = function (days: number) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  currentDate = addDays.call(currentDate, 1); //Exclude from date
  while (currentDate < to) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

// Returns the ISO week of the date.
export const getWeekNumber = (d: Date) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = +new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((+d - yearStart) / 86400000 + 1) / 7);
};

export const addMonthsToDate = (date: Date, monthToAdd: number) =>
  new Date(date.setMonth(date.getMonth() + monthToAdd));

export const formatDateToString = (date: Date) => {
  try {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch (error) {
    return null;
  }
};

export const formatDateIntervallforMonthlyPayout = (
  month: number,
  year: number,
) => {
  let monthBefore = 0;
  let yearBefore = year;
  switch (month) {
    case 1:
      monthBefore = 12;
      yearBefore = year - 1;
      break;
    default:
      monthBefore = month - 1;
      break;
  }
  const from = stringToDate(`26/${monthBefore}/${yearBefore}`);
  const to = stringToDate(`25/${month}/${year}`);
  return {
    from: {
      value: from,
      month: monthBefore,
      year: yearBefore,
    },
    to: {
      value: to,
      month,
      year,
    },
  };
};

export const isDateBetween = (
  startDate: Date,
  endDate: Date,
  dateToVerify: Date,
) => {
  return dateToVerify >= startDate && endDate >= dateToVerify;
};

export const convertStringToDate = (date?: string) => {
  const dateParts = date.split('/');
  return new Date(`${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`);
};

export const formatDatesInterval = (startDate: Date, endDate: Date) => {
  const formatedEndDate = endDate;
  if (formatedEndDate) {
    formatedEndDate.setHours(23, 59, 59, 999);
  }
  const formatedOneDateFilter = endDate
    ? null
    : {
        startDate: new Date(startDate),
        endDate: new Date(startDate),
      };
  if (formatedOneDateFilter) {
    formatedOneDateFilter.startDate.setHours(0, 0, 0, 0);
    formatedOneDateFilter.endDate.setHours(23, 59, 59, 999);
  }
  return { formatedEndDate, formatedOneDateFilter };
};

export const stringToFullDate = (date: string) => {
  try {
    const dateParts = date.split(' ');
    const day = dateParts[0];
    const time = dateParts[1];
    const dayParts = day.split('/');
    const timeParts = time.split(':');
    return new Date(
      `${dayParts[2]}-${dayParts[1]}-${dayParts[0]}T${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`,
    );
  } catch (error) {
    return null;
  }
};

export const getCurrentWeekInterval = () => {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();

  // Calculate the difference to Monday
  const distanceToMonday = (currentDay + 6) % 7;

  // Calculate the first day of the week (Monday)
  const firstDayOfWeek = new Date(currentDate);
  firstDayOfWeek.setDate(currentDate.getDate() - distanceToMonday);
  firstDayOfWeek.setHours(0, 0, 0, 0); // Set to start of the day

  // Calculate the last day of the week (Sunday)
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999); // Set to end of the day

  return {
    start: firstDayOfWeek,
    end: lastDayOfWeek,
  };
};

export const getCurrentMonthInterval = () => {
  const currentDate = new Date();

  // Calculate the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0); // Set to start of the day

  // Calculate the last day of the current month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  lastDayOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

  return {
    start: firstDayOfMonth,
    end: lastDayOfMonth
  };
}