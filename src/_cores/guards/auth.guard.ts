import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException();
    }

    const accessToken = token.slice(7);

    try {
      const payload =
        await this.jwtService.verifyAsync<IUserPayload>(accessToken);

      const user = {
        _id: payload._id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      };

      request.currentUser = user;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(error);
      }

      throw new UnauthorizedException();
    }

    return true;
  }
}
