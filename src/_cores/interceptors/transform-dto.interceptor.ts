import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type ClassType<T> = {
  new (...args: any[]): T;
};

export function TransformDTO<T>(dto: ClassType<T>) {
  return UseInterceptors(new TransformDTOInterceptor(dto));
}

@Injectable()
export class TransformDTOInterceptor<T> implements NestInterceptor {
  constructor(private readonly dtoClass: ClassType<T>) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const isAuthenticationUrl = request.path.includes('auth');

    return next.handle().pipe(
      map((data) => {
        if (isAuthenticationUrl) {
          const { user, accessToken } = data;

          return {
            message: 'success',
            data: plainToInstance(this.dtoClass, user, {
              excludeExtraneousValues: true,
            }),
            accessToken,
          };
        }

        return {
          message: 'success',
          data: plainToInstance(this.dtoClass, data, {
            excludeExtraneousValues: true,
          }),
        };
      }),
    );
  }
}
