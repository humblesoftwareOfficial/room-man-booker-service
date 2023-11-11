/* eslint-disable prettier/prettier */
import { HttpStatus } from '@nestjs/common';

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface Response {
  code: HttpStatus;
  message?: string;
}

interface Failure extends Response {
  error: any;
}

interface Success<D> extends Response {
  data: D;
  success: boolean;
}

type SuccessArg<D> = WithOptional<Omit<Success<D>, 'success'>, 'code'>;

type FailureArg = WithOptional<Failure, 'code'>;

export type Result<D = any> = Success<D> | Failure;

export function succeed<D>({
  data,
  code = HttpStatus.OK,
  message,
}: SuccessArg<D>): Success<D> {
  return { code, message, data, success: true };
}

export function fail({
  error,
  code = HttpStatus.INTERNAL_SERVER_ERROR,
  message,
}: FailureArg) {
  return { error, code, message };
}

export const exceptionHandlingMessage = (error: any) => {
  switch (error.name) {
    case 'ValidationError':
      return error._message;
    default:
      return '';
  }
};
